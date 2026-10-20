require "minitest/autorun"
require "tmpdir"
require "fileutils"
require "jekyll"
require "nokogiri"
require "date"
require "yaml"

module PostValidation
  def self.errors(root)
    errors = []
    slugs = {}
    Dir.glob(File.join(root, "_posts", "**", "*"), File::FNM_DOTMATCH).sort.each do |path|
      next unless File.file?(path)
      next if File.basename(path) == ".gitkeep"

      relative = path.delete_prefix("#{root}/")
      match = /\A(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md\z/.match(File.basename(path))
      unless match
        errors << "#{relative}: use YYYY-MM-DD-lowercase-slug.md"
        next
      end
      begin
        date = Date.iso8601(match[1])
        raise ArgumentError if date.year < 1
      rescue ArgumentError
        errors << "#{relative}: invalid publication date #{match[1]}"
      end
      slug = match[2]
      errors << "#{relative}: duplicate slug '#{slug}', already used by #{slugs[slug]}" if slugs.key?(slug)
      slugs[slug] = relative

      begin
        text = File.read(path, encoding: "UTF-8").sub(/\A\uFEFF/, "")
        front_matter = /\A---\r?\n(.*?)\r?\n---(?:\r?\n|\z)/m.match(text)
        raise ArgumentError, "start with a YAML front matter block between --- lines" unless front_matter

        data = YAML.safe_load(front_matter[1], permitted_classes: [Date, Time], aliases: false)
        raise ArgumentError, "front matter must be a YAML mapping" unless data.is_a?(Hash)
        %w[title].each do |key|
          unless data[key].is_a?(String) && !data[key].strip.empty?
            errors << "#{relative}: '#{key}' must be a non-empty string"
          end
        end
        %w[date slug permalink layout published].each do |key|
          errors << "#{relative}: do not override '#{key}'; use filename conventions and _drafts/" if data.key?(key)
        end
      rescue Psych::Exception, ArgumentError, EncodingError => e
        errors << "#{relative}: #{e.message}"
      end
    end
    errors
  end
end



class BlogTest < Minitest::Test
  def test_repository_post_conventions
    assert_empty PostValidation.errors(ROOT)
  end
  ROOT = File.expand_path("..", __dir__)

  def setup
    @temporary = Dir.mktmpdir("zoto-blog-test-")
    @source = File.join(@temporary, "source")
    FileUtils.mkdir_p(@source)
    Dir.children(ROOT).each do |entry|
      next if %w[.git .bundle .jekyll-cache _site vendor].include?(entry)
      FileUtils.cp_r(File.join(ROOT, entry), @source)
    end
    FileUtils.rm_rf(File.join(@source, "_posts"))
    FileUtils.mkdir_p(File.join(@source, "_posts"))
    @destination = File.join(@temporary, "built")
  end

  def teardown
    FileUtils.remove_entry(@temporary)
  end

  def post(filename, metadata = "title: 'An article'", body = "A paragraph.")
    File.write(File.join(@source, "_posts", filename), "---\n#{metadata}\n---\n\n#{body}\n")
  end

  def build
    problems = PostValidation.errors(@source)
    raise Jekyll::Errors::FatalException, problems.join("\n") unless problems.empty?
    Jekyll.logger.log_level = :error
    config = Jekyll.configuration("source" => @source, "destination" => @destination, "quiet" => true)
    site = Jekyll::Site.new(config)
    site.process
    site
  end

  def html(path = "index.html")
    Nokogiri::HTML(File.read(File.join(@destination, path)))
  end

  def errors
    PostValidation.errors(@source).join("\n")
  end

  def test_empty_site_and_public_metadata
    build
    assert_includes html.text, "No posts yet"
    assert_equal "Zoto Blog", html.at_css("title").text
    assert_equal "https://zotodev.github.io/", html.at_css('link[rel="canonical"]')["href"]
    assert_includes html("404.html").text, "isn't here"
    assert_equal 0, Nokogiri::XML(File.read(File.join(@destination, "feed.xml"))).xpath("//item").size
    assert File.exist?(File.join(@destination, "sitemap.xml"))
    %w[scripts templates test _drafts].each { |entry| refute File.exist?(File.join(@destination, entry)) }
  end

  def test_dates_ties_backdating_edits_and_generated_links
    post("2001-02-02-zebra.md")
    post("2001-01-01-oldest.md")
    post("2001-02-02-alpha.md")
    post("2001-02-01-backdated.md")
    post("2999-01-01-future.md")
    File.write(File.join(@source, "_drafts", "draft.md"), "---\ntitle: Secret draft\n---\nNot published")
    build
    expected = %w[alpha zebra backdated oldest].map { |slug| "/posts/#{slug}/" }
    assert_equal expected, html.css(".post-row").map { |link| link["href"] }
    refute File.exist?(File.join(@destination, "search.json"))
    feed = Nokogiri::XML(File.read(File.join(@destination, "feed.xml")))
    assert_empty feed.errors
    assert_equal expected.map { |url| "https://zotodev.github.io#{url}" }, feed.xpath("//item/link").map(&:text)
    sitemap = File.read(File.join(@destination, "sitemap.xml"))
    expected.each { |url| assert_includes sitemap, url }
    refute_includes sitemap, "future"
    refute_includes sitemap, "draft"
    refute File.exist?(File.join(@destination, "posts", "future"))
    post("2001-01-01-oldest.md", "title: 'Changed title'\ndescription: 'Changed summary'", "Edited body.")
    build
    assert_equal expected, html.css(".post-row").map { |link| link["href"] }
    assert_includes html("posts/oldest/index.html").text, "Changed title"
    assert_includes html("posts/oldest/index.html").text, "Edited body."
  end

  def test_article_markdown_and_escaping
    post("2001-01-01-formatting.md", "title: '<script>bad()</script>'\ndescription: 'Code & writing'", <<~MD)
      ## A heading

      A [link](/) and **bold text**.

      - An item

      ![Test image](/assets/images/formatting/test.svg)

      ```ruby
      puts "hello"
      ```
    MD
    image_dir = File.join(@source, "assets", "images", "formatting")
    FileUtils.mkdir_p(image_dir)
    File.write(File.join(image_dir, "test.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><rect width="200" height="80" fill="#aaa"/></svg>')
    build
    article = html("posts/formatting/index.html")
    refute_includes article.text, "Code & writing"
    assert_equal "A heading", article.at_css(".prose h2").text
    assert article.at_css(".prose ul li")
    assert article.at_css(".prose pre code")
    assert_equal "Test image", article.at_css(".prose img")["alt"]
    assert_equal "<script>bad()</script>", article.at_css("h1").text
    assert_empty article.css("h1 script")
    assert_equal "https://zotodev.github.io/posts/formatting/", article.at_css('link[rel="canonical"]')["href"]
    assert_equal "2001-01-01", article.at_css("time")["datetime"]
    assert File.exist?(File.join(@destination, "assets", "images", "formatting", "test.svg"))
  end

  def test_invalid_filenames_dates_and_duplicates
    post("2001-02-30-invalid.md")
    post("2001-01-01-Slug.md")
    post("2001-01-01-duplicate.md")
    post("2002-01-01-duplicate.md")
    assert_includes errors, "invalid publication date"
    assert_includes errors, "use YYYY-MM-DD-lowercase-slug.md"
    assert_includes errors, "duplicate slug 'duplicate'"
    assert_raises(Jekyll::Errors::FatalException) { build }
  end

  def test_invalid_metadata_and_convention_overrides
    post("2001-01-01-blank.md", "title: ''\ndescription: []")
    post("2001-01-01-malformed.md", "title: [")
    post("2001-01-01-overrides.md", "title: Good\ndescription: Good\ndate: 2002-01-01\nslug: other\npermalink: /other/\nlayout: default\npublished: false")
    File.write(File.join(@source, "_posts", "2001-01-01-no-frontmatter.md"), "# A post")
    assert_includes errors, "'title' must be a non-empty string"

    assert_includes errors, "start with a YAML front matter block"
    %w[date slug permalink layout published].each { |key| assert_includes errors, "do not override '#{key}'" }
  end

  def test_valid_leap_day_and_crlf_frontmatter
    post("2000-02-29-leap-day.md")
    path = File.join(@source, "_posts", "2000-02-29-leap-day.md")
    File.write(path, File.read(path).gsub("\n", "\r\n"))
    assert_empty errors
    build
    assert File.exist?(File.join(@destination, "posts", "leap-day", "index.html"))
  end
end

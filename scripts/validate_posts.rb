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
        %w[title description].each do |key|
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

if $PROGRAM_NAME == __FILE__
  errors = PostValidation.errors(File.expand_path("..", __dir__))
  abort errors.join("\n") unless errors.empty?
  puts "Post conventions validated."
end

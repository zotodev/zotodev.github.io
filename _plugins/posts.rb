require_relative "../scripts/validate_posts"

Jekyll::Hooks.register :site, :after_init do |site|
  errors = PostValidation.errors(site.source)
  raise Jekyll::Errors::FatalException, errors.join("\n") unless errors.empty?
end

module Zoto
  class OrderedPosts < Jekyll::Generator
    safe true
    priority :lowest

    def generate(site)
      site.data["ordered_posts"] = site.posts.docs.sort_by do |post|
        [-post.date.to_date.jd, post.data.fetch("slug")]
      end
    end
  end
end

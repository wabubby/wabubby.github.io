require 'yaml'

posts = Dir['_posts/*.md']
tags = posts.flat_map do |file|
  data = YAML.load_file(file, permitted_classes: [Date], aliases: true) || {}
  data['tags'] || []
end.uniq

Dir.mkdir('tags') unless Dir.exist?('tags')

tags.each do |tag|
  File.write("tags/#{tag}.md", <<~FILE)
    ---
    layout: tag
    title: "#{tag.capitalize}"
    tag: "#{tag}"
    ---
  FILE
end
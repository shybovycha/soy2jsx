require 'parallel'

SD_PATH = '../servicedesk'

files = Dir["#{SD_PATH}/**/*.soy"].reject { |f| f =~ /\/sdmakehome\// || f =~ /\/target\/classes\// } 
results = Hash[files.map { |f| `node index.js #{f} &>/dev/null`; [f, $?] } ]

successful = results.select { |_, r| r == 0 }
failed = results.select { |_, r| r != 0 }

puts "Successful: #{successful.size} / #{results.size}"
puts "Failed: #{failed.size} /  #{results.size}"
puts "Failures:\n#{failed.keys.map { |f| "\t" + f }.join "\n"}"


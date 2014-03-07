navstack.css: navstack.styl
	./node_modules/.bin/stylus < $^ | ./node_modules/.bin/autoprefixer -b "> 1%" > $@

PKG:=@jkcfg/tekton

.PHONY: all dist clean test build-image

dist: src/api.ts
# tsc will create the @jkcfg/tekton directory
	npx tsc
	npx tsc -d --emitDeclarationOnly --allowJs false
	cp README.md LICENSE package.json ${PKG}/

clean:
	rm -rf @jkcfg
	rm -rf ./build

test:
	npm test
	npm run lint

build-image: dist
	mkdir -p build/image
	cp -R @jkcfg build/image/
	docker build -t jkcfg/tekton -f Dockerfile build/image

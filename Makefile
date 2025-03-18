.PHONY: rundocker buiddocker

builddocker:
	docker build -t onboarddev .

rundocker:
	docker run -v ${PWD}:/app -p 7777:7777 -t --name onboarddev onboarddev


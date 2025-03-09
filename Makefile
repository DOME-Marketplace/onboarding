.PHONY: rundocker buiddocker

builddocker:
	docker build -t onboardpre .

rundocker:
	docker run -v ${PWD}:/app -p 6666:6666 -t --name onboardpre -d onboardpre


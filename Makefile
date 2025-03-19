.PHONY: rundocker buiddocker

builddocker:
	docker build -t onboarding .

rundev:
	docker run -v ${PWD}:/app --env DOME_CONFIG_FILE=config/dev_config.yaml -p 7777:7777 -t --name onboarddev -d onboarding

runpre:
	docker run -v ${PWD}:/app --env DOME_CONFIG_FILE=config/pre_config.yaml -p 6666:6666 -t --name onboardpre onboarding

runprod:
	docker run -v ${PWD}:/app --env DOME_CONFIG_FILE=config/prod_config.yaml -p 5555:5555 -t --name onboardpro onboarding


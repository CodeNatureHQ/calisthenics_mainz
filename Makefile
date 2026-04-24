VERCEL_TOKEN := vcp_4QLZwarEEc8xsohFMrK2wZAts95c1PSYWrGMw21tC4AdQADYyv1CpqS5
VERCEL_SCOPE := codenatures-projects-4fdbde50

.PHONY: deploy commit

## Deploy to Vercel (build lokal, push to production)
deploy:
	vercel --token $(VERCEL_TOKEN) --scope $(VERCEL_SCOPE) --prod --yes

## Commit all changes + deploy
commit:
	@read -p "Commit-Nachricht: " msg; \
	git add -A && \
	git commit -m "$$msg"

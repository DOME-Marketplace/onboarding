FROM gcr.io/distroless/base-debian12:debug-nonroot

WORKDIR /app
EXPOSE 6666 6666
COPY docker/distroless_group /etc/group
COPY docker/distroless_passwd /etc/passwd
USER ubuntu

ENTRYPOINT ["/app/domeonboarding", "serve"]
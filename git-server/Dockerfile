FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server git curl bash gzip tar jq ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /run/sshd

# -p '*' gives the account a password field that can never match any typed
# password, without being "locked" (a '!' prefix) -- OpenSSH refuses login
# for a locked account even via pubkey, independent of UsePAM.
RUN useradd -m -d /home/git -s /usr/local/bin/opengit-shell -p '*' git

COPY git-server/sshd_config /etc/ssh/sshd_config
COPY git-server/opengit-shell.sh /usr/local/bin/opengit-shell
COPY git-server/post-receive.template /usr/local/share/opengit/post-receive.template
COPY git-server/entrypoint.sh /entrypoint.sh
RUN chmod +x /usr/local/bin/opengit-shell /entrypoint.sh

VOLUME ["/repos", "/etc/ssh"]
EXPOSE 22

ENTRYPOINT ["/entrypoint.sh"]

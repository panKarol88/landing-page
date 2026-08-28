# Local setup

These commands set up the local development dependencies on Ubuntu 22.04.

## Ruby 3.3 and Rails

Install the build dependencies:

```sh
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  build-essential autoconf bison libssl-dev libyaml-dev libreadline-dev \
  zlib1g-dev libncurses5-dev libffi-dev libgdbm-dev libdb-dev uuid-dev \
  rustc cargo
```

Build Ruby from the official source archive (Jammy's apt Ruby is 3.0):

```sh
mkdir -p "$HOME/src" "$HOME/.rubies"
curl -L --fail -o "$HOME/src/ruby-3.3.6.tar.gz" \
  https://cache.ruby-lang.org/pub/ruby/3.3/ruby-3.3.6.tar.gz
tar -xzf "$HOME/src/ruby-3.3.6.tar.gz" -C "$HOME/src"
cd "$HOME/src/ruby-3.3.6"
./configure --prefix="$HOME/.rubies/ruby-3.3.6" \
  --disable-install-doc --with-openssl-dir=/usr
make -j2
make install
echo 'export PATH="$HOME/.rubies/ruby-3.3.6/bin:$PATH"' >> "$HOME/.bash_profile"
export PATH="$HOME/.rubies/ruby-3.3.6/bin:$PATH"
gem install rails -v '~> 8.1' --no-document
```

## PostgreSQL

```sh
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  postgresql postgresql-contrib libpq-dev
sudo pg_ctlcluster 14 main start
sudo -u postgres createuser --superuser "$USER"  # skip if the role exists
pg_isready
```

The Rails database configuration uses the local Unix socket and the
current operating-system user, so no password is needed.

## Application dependencies

```sh
cd ~/repos/landing-page/api
bundle install
cp .env.example .env
# Edit .env and set ADMIN_PASSWORD and JWT_SECRET.
bin/rails db:create db:migrate db:seed
bin/rails server -p 3000
```

The API is available at `http://localhost:3000`. The local Active Storage
disk service stores uploads under `api/storage`.

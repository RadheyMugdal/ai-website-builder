FROM node:21-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install dependencies and customize sandbox
WORKDIR /home/user/nextjs-app

RUN npx create-next-app@15.3.3 . --ts --tailwind --no-src-dir --app --no-turbopack --no-eslint --no-import-alias

RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force
RUN npx --yes shadcn@2.6.3 add --all --yes

CMD ["npm", "run", "dev"]
ENTRYPOINT ["/bin/bash", "-c", "npm run dev & tail -f /dev/null"]

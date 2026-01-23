
if [ ! -d node_modules ] && [ -f package.json ] ; then
    echo "Running: npm install"
    npm install -g sass
    npm install
fi

tail -f /dev/null

# Running the tests
#npm run test

#npm run dev
#!/bin/bash

rm -rf cypress/videos/* 2>/dev/null

npm run cypress:run
status=$?

if [ -d "cypress/videos" ] && [ "$(ls -A cypress/videos)" ]; then
    open cypress/videos/**/*.mp4 2>/dev/null || open cypress/videos/*.mp4
fi

exit $status

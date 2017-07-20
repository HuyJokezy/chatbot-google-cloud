git add fbmsg && git commit -m fbmsg && git push origin master && gcloud beta functions deploy fbmsg --source-url https://source.developers.google.com/p/chatbot-52601/r/beta --source-path "/fbmsg" --trigger-http --source-branch master --entry-point handler
pause

Overview

I created a web app that lets users view and leave comments on the latest Oxygen Magazine news. I used Mongoose and Cheerio to scrape news from Oxygen Magazine website.

Whenever a user visits my site, the app will scrape stories from Oxygen Magazine and display them for the user. Each scraped article is saved to the oxygebdb database. When scraped site displays:


 * Headline - the title of the article

 * Summary - a short summary of the article

 * URL - the url to the original article


Users can leave comments on the articles displayed and revisit them later. Comments are saved to the database and associated with their articles. Users can also delete comments left on articles. All stored comments should be visible to every user.

Deployed site: https://dry-stream-81077.herokuapp.com/

npm packages:

express
mongoose
cheerio
axios

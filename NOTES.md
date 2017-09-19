* `travis setup heroku`
* `heroku create`
  * copy the heroku app name and paste it into the `deploy:app:` setting in `.travis.yml`

* go to mLab and provision a new DB
  * add a user for this DB
* visit Heroku dashboard
  * click `Settings`, then `Reveal Config Vars`
    * create an entry for `DATABASE_URL` with the value `mongodb://<dbuser>:<dbpassword>@ds99999.mlab.com:9999/node-restaurants-app` replacing the values for your DB and DB user
    

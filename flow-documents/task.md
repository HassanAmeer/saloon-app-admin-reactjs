



You are an expert React + Firebase developer. please update or restore existing project features according to requirements.

There are EXACTLY TWO admin panels / dashboards:

1. Platform Owner Panel (platform owner — highest level)
route should be /super
2. Salon Owner Panel (each salon owner — created only by Platform Owner)
route should be /manager

  - just for login by these 2 routes can only . 

the existing panel should convert into salon owner panel 





### 1st is salon owner .
* the existing others things same but should update the ui and flow  *

-- Side Bar 
 - Dashboard
 - Stylists 
    - Stylists: list of stylist and analytics
       - clients:
         - each stylist have multiple clients and sales and ai recommendations
         - clients list of each stylist
         - sales list of each stylist
         - ai recommendations list of each clients
         - stylist profile
 - Products
 - Sales & Analytics
 - Profile
 - App Config
 - Settings
     -- Privacy Policy & Terms & Conditions
     -- Support Settings

*How stylist will work*
- the salon owner creates a multiple stylists and. stylist can have multiple clients and sales and ai recomendation. 


- stylist page :
same existing features the salon owner can create multiple stylists and each stylist have own profile and can update her profile and also can upload her skills bio name email phone number and password from profile page of each selectd salon owner. active in active . how much clients and how sold products and how much scans . and in table also its name email and phone number and active status and stylist id . but if click to view then should also show more details and charts  and. analytics and clients + sold products of each clients tables. and  also client data can be updated by salon owner. ai recomendations with each stylist when selected

- Sales Tracking in salon owner page:
make sure salon owner can Monitor and analyze sales performance of stylists and how much stylists have and how much products sold and how much products revenue and total sales and how much cleints under each stylist . in analytics and box cards stylist or any thats greate ui. and then also make a table of cleints names list its name from stylist name and how much products sales and quantity , date time, amount session id. also on click on stylist name can see the details of each stylist analytics


### 2nd: platform owner can create multiple salon owner with email and password just.
and salon owner inside can upload her skills bio name email phone number and password from profile page of each selectd salon owner.
and all other also can platform owner can watch and update every thing  like he can select each salon owner  and same see all things and managements how much stylist have and how much each stylist have clients and products and each stylist analytics every things.
and also each salon owner how much have stylist and sales and products and questions and hair types added.

*** by defaults things: when platform owner create salon owner ***
- same all salon owner panel all features + platform owner can create new salon owner with email and password , name, profile image, phone number, bio, skills, active status+ can update own profile.

- defaults data when platform owner create salon owner for salon owner quicly setup:
    - when platform owner create salon owner then in contact support should have the default email is salon@manager.com, and phone number is +0123456789  will be adding.
    - first 2 products will be added for each salon owner when created by platform owner. (1. Argan Oil Elixir. 2. Silver Bright Shampoo).
    - and default same existing Questionnaire
    - default same existing Hair Types, Hair Conditions ,  Hair Scan Metrics also same existing as default data
    - default same existing Visual Hair Colors existing data as default

*** also default data for migration into database should also add in data-migration.mockData.js file well structured and when /seeding route then also can migrate the data collections and documents added in firebase ***
- also when migration then platform owner default login should be admin@gmail.com, password should be 12345678

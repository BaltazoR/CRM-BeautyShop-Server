# CRM BeautyShop (Backend)


### ссылка на фронтэнд  [https://d2z0iokdukqe3z.cloudfront.net/](https://d2z0iokdukqe3z.cloudfront.net/)

### API [beautyshop-server.herokuapp.com/api](http://beautyshop-server.herokuapp.com/api)

### Презентация [link](https://docs.google.com/presentation/d/1evrs7UpZOxepx1hq7074Vvzf9nr5iprIEHFn8FL57yU/)

# Routes for users:

### Без авторизации:

| ROUTE | DESCRIPTION |
| ------------ | ------------ |
| post /login | авторизация пользователя |
| post /users | создание нового пользователя |
| get /users | вывод информации всех пользователей в базе |
| get /users/id | вывод информации пользователя (по его id) |
| post /recovery/ | отправка ссылки\* для востановления пароля на указанный email |
| put /setpass/ | уcтановка нового пароля по ссылке с email |

\* ccылка вида - baseUrl/?token=token
  
### C авторизацией:

| ROUTE | DESCRIPTION |
| ------ | ------ |
| put /users/id | редактирование информации пользователя (по его id) |




# Routes for entries:
### Без авторизации:

| ROUTE | DESCRIPTION |
| ------------ | ------------ |
| post /entries | создать запись |
| get /entries | вывод информации всех записей |
| get /entries/id | вывод информации одной записи (по её id) |
| get /entries/id?q=master | вывод информации всех записей мастера (по его id) |
| get /entries/id?q=customer | вывод информации всех записей клиента (по его id) |
| \* get /entries/master/id?date='XX.XX.XXXX' | вывод всех записей мастера (по его id) на выбранную дату |
| get /entries/user/id?date='XX.XX.XXXX' | вывод всех записей пользователя (по его id) на выбранную дату |

  
###  C авторизацией:

| ROUTE | DESCRIPTION |
| ------------ | ------------ |
| put /entries/id  | редактирование записи (по её id) |


---

\* deprecated

# Routes push:
### C авторизацией:

| ROUTE | DESCRIPTION |
| ------------ | ------------ |
| post /subscribe | подписаться на WebPush уведомления |
| post /unsubscribe | отписаться от WebPush уведомлений |
| post /checksubscribe | проверка статуса подписки на WebPush уведомления |



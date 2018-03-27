# CRM BeautyShop (Backend)


### ссылка на фронтэнд  [beautyshop-server.herokuapp.com](http://beautyshop-server.herokuapp.com)

### API [beautyshop-server.herokuapp.com/api](http://beautyshop-server.herokuapp.com/api)

# Routes for users:

### Без авторизации:

| ROUTE | DESCRIPTION |
| ------------ | ------------ |
| post/login | авторизация пользователя |
| post/users | создание нового пользователя |
| get/users | вывод информации всех пользователей в базе |
| get/users/id | вывод информации пользователя (по его id) |

  
### C авторизацией:

| ROUTE | DESCRIPTION |
| ------ | ------ |
| put/users/id | редактирование информации пользователя (по его id) |




# Routes for entries:
### Без авторизации:

| ROUTE | DESCRIPTION |
| ------------ | ------------ |
| post/etries | создать запись |
| get/etries | вывод информации всех записей |
| get/etries/id | вывод информации одной записи (по её id) |
| get/etries/id?q=masters | вывод информации всех записей мастера (по его id) |
| get/etries/id?q=customers | вывод информации всех записей клиента (по его id) |
| *** put/etries/id | редактирование записи (по её id) |

  
### ** C авторизацией:

| ROUTE | DESCRIPTION |
| ------------ | ------------ |
| put/etries/id  | редактирование записи (по её id) |


---

** пока не реализовано

*** временно, для теста фронтендерам

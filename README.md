# premium_client_server

-- CREATE TABLE Client (
--     id int PRIMARY KEY AUTO_INCREMENT,
--     fullname varchar(255),
--     phoneNumber varchar(255),
--     passport varchar(255),
--     birth_date varchar(255),
--     image varchar(255),
--     verified BOOLEAN default false,
--     status varchar(255) default "default",
--     limit_summa double,
--     expired TIMESTAMP,
--     pinfl varchar(255),
--     created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     verified_time TIMESTAMP,
--  );

-- ALTER TABLE MyId ADD created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- CREATE TABLE Otp (
--     id varchar(40) PRIMARY KEY NOT NULL,
--     code varchar(255),
--     client_id int,
--     used boolean default false,
--     created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- insert into Otp (code,client_id,id)   values ("123123",1, REPLACE(MD5(UUID()),'-','') ) ;

select * from Otp;



use premiumdb;
create table Ariza(
   id int primary key auto_increment,
   client_id int,
   accepted_id int,
   limit_summa double,
   banks json ,
   created_time timestamp default current_timestamp,
   canceled_reason varchar(255),
    status varchar(50) default "created", -- canceled ,success ,
    expires_in timestamp

);

create table bankZayavka(
	 id int primary key auto_increment,
   ariza_id int ,
   zayavka_id  int,
   type varchar(40) not null, -- merchant , client
	created_time timestamp default current_timestamp,
    response_time timestamp ,
   limit_summa double,
	bank_id int not null,

   canceled_reason varchar(255),
   status varchar(50) default "created" -- canceled ,success ,accepted
);
create table Bank(
	 id int primary key auto_increment,
   name varchar(30) not null,
   banks json ,
   months json default ("['3','6','9','12']"),
   fapi double default 0,
	insurance double default 0,
   max_age int default 64,
   min_age int  default 18,
   created_time timestamp default current_timestamp,
   types json default ("['rasmiy daromad','karta','pensioner']"),
   blocked_regions json default ("['03']")
);

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
--     created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- insert into Otp (code,client_id,id)   values ("123123",1, REPLACE(MD5(UUID()),'-','') ) ;

select * from Otp;





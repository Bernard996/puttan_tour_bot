CREATE TABLE PLACES ( ID INTEGER PRIMARY KEY AUTO_INCREMENT,CHATID VARCHAR(255) NOT NULL,USERID VARCHAR(255) NOT NULL,TIMESTAMP DATETIME DEFAULT CURRENT_TIMESTAMP,NAME VARCHAR(255) NOT NULL,VISITED DATETIME,RATING FLOAT,TYPE VARCHAR(255) NOT NULL,URL TEXT NOT NULL);
CREATE TABLE RATING (PLACEID INTEGER NOT NULL,USERID VARCHAR(255) NOT NULL,RATING FLOAT NOT NULL,COMMENT TEXT,PRIMARY KEY (PLACEID, USERID),FOREIGN KEY (PLACEID) REFERENCES PLACES(ID));

INSERT INTO PLACES VALUES(1,'-1001915571587','19986127','2024-01-24 17:24:12','Rock burger',NULL,NULL,'mangiare','https://maps.app.goo.gl/eS1bZTryCL4yEJ7x5');
INSERT INTO PLACES VALUES(2,'-1001915571587','19986127','2024-01-24 17:24:23','Casa di sara',NULL,NULL,'visitare','');
INSERT INTO PLACES VALUES(3,'-1001897649912','19986127','2024-01-25 11:20:48','Sonamu Korean Restaurant',NULL,NULL,'mangiare','https://g.co/kgs/bAuyNK');
INSERT INTO PLACES VALUES(4,'-1001897649912','19986127','2024-01-25 11:21:04','Kadeh Meze Wine Bar',NULL,NULL,'mangiare','https://g.co/kgs/BTPYUN');
INSERT INTO PLACES VALUES(5,'-1001897649912','19986127','2024-01-25 11:21:24','La Prosciutteria Torino',NULL,NULL,'mangiare','https://g.co/kgs/ozVRAh');
INSERT INTO PLACES VALUES(6,'-1001897649912','19986127','2024-01-25 11:21:39','Bell’e Buon Street Food Partenopeo',NULL,NULL,'mangiare','https://g.co/kgs/LZEqMr');
INSERT INTO PLACES VALUES(7,'-1001897649912','19986127','2024-01-25 11:21:54','PiZZandART',NULL,NULL,'mangiare','https://g.co/kgs/mA4Esm');
INSERT INTO PLACES VALUES(8,'-1001897649912','19986127','2024-01-25 11:22:13','Pizza Crocca',NULL,NULL,'mangiare','https://maps.app.goo.gl/gRpiDXQTFnHc9bQZ9');
INSERT INTO PLACES VALUES(9,'-1001897649912','19986127','2024-01-25 11:22:33','I mascalzoni',NULL,NULL,'mangiare','https://maps.app.goo.gl/h95MTt1Dy8q7KA6YA');
INSERT INTO PLACES VALUES(10,'-1001897649912','19986127','2024-01-25 11:22:48','Mole Pub',NULL,NULL,'mangiare','https://maps.app.goo.gl/N4Q4QTwxtJChfaWd7');
INSERT INTO PLACES VALUES(11,'-1001897649912','19986127','2024-01-25 11:23:44','Smashy',NULL,NULL,'mangiare','https://maps.app.goo.gl/2U4eRoMucfZkryBn6');
INSERT INTO PLACES VALUES(12,'-1001897649912','19986127','2024-01-25 11:24:02','Sushi Club','2023-09-04',4.3333333333333330372,'mangiare','https://g.co/kgs/Mn2aaB');
INSERT INTO PLACES VALUES(13,'-1001897649912','19986127','2024-01-25 11:24:18','Hot Pot',NULL,NULL,'mangiare','https://g.co/kgs/d4eiVU');
INSERT INTO PLACES VALUES(14,'-1001897649912','19986127','2024-01-25 11:24:33','Zheng Yang',NULL,NULL,'mangiare','https://g.co/kgs/M4GYxb');
INSERT INTO PLACES VALUES(15,'-1001897649912','19986127','2024-01-25 11:24:47','Osteria da Gemma',NULL,NULL,'mangiare','https://maps.app.goo.gl/wtAuQ93BGjT4SgWv5');
INSERT INTO PLACES VALUES(16,'-1001897649912','19986127','2024-01-25 11:24:59','Mr Pig','2024-01-12',3.0,'mangiare','https://maps.app.goo.gl/xgGgHAxty16HQi998');
INSERT INTO PLACES VALUES(17,'-1001897649912','19986127','2024-01-25 11:25:15','Panzerotteria',NULL,NULL,'mangiare','https://maps.app.goo.gl/CApKwoCQgoz6Ljnf6');
INSERT INTO PLACES VALUES(18,'-1001897649912','19986127','2024-01-25 11:28:17','Mik','2023-10-28',4.75,'mangiare','https://g.co/kgs/s8NKyFp');
INSERT INTO PLACES VALUES(19,'-1001897649912','19986127','2024-01-26 07:39:28','Gari sushi',NULL,NULL,'mangiare','https://maps.app.goo.gl/3tgSZ9nnsqQpr7ux5');
INSERT INTO RATING VALUES(18,'19986127',4.0,'Locale fighissimo e molto buono, I CAMERIERI UN PO'' MENO');
INSERT INTO RATING VALUES(16,'19986127',3.0,'Buona la schiacciata ma un po'' troppo asciutta');
INSERT INTO RATING VALUES(12,'19986127',5.0,'Posto stupendo, piatti particolari e molto buoni, pollice in su soprattutto per quegli uramaki all''anguilla spaziali');
INSERT INTO RATING VALUES(12,'141298200',4.0,'Sushi bello e buono, la location di più (anguilla-scoperta)');
INSERT INTO RATING VALUES(18,'141298200',5.0,replace('Mio sushi preferito ❤️\nTutto spaziale, dal nigiri al salmone piccolo e tenero al bagno immenso che sprizza riccanza da ogni ugello. Quando torniamo?','\n',char(10)));
INSERT INTO RATING VALUES(16,'141298200',3.0,'Mi ha lasciato un po'' l''amaro in bocca, oltre che l''asciutto sahariano...');
INSERT INTO RATING VALUES(18,'91833258',5.0,'Piaciuto un botto, quasi come quello che ha fatto un vassoio cadendo a terra mentre eravamo lì (assolutamente a caso eh. Non perché buttato giù da qualcuno). Location davvero figa, camerieri un po'' poco disponibili');
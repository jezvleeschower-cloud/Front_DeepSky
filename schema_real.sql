-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: deepsky
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `ID_CATEGORIA` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(100) NOT NULL,
  `DESCRIPCION` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID_CATEGORIA`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comentario_foro`
--

DROP TABLE IF EXISTS `comentario_foro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentario_foro` (
  `ID_COMENTARIO` int NOT NULL AUTO_INCREMENT,
  `FORO_ID` int NOT NULL,
  `USUARIO_ID` int NOT NULL,
  `CONTENIDO` text NOT NULL,
  `URL_IMAGEN` varchar(500) DEFAULT NULL,
  `FECHA_CREACION` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_COMENTARIO`),
  KEY `FORO_ID` (`FORO_ID`),
  KEY `USUARIO_ID` (`USUARIO_ID`),
  CONSTRAINT `comentario_foro_ibfk_1` FOREIGN KEY (`FORO_ID`) REFERENCES `foro` (`ID_FORO`),
  CONSTRAINT `comentario_foro_ibfk_2` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comentario_imagen_dia`
--

DROP TABLE IF EXISTS `comentario_imagen_dia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentario_imagen_dia` (
  `ID_COMENTARIO` int NOT NULL AUTO_INCREMENT,
  `IMAGEN_DIA_ID` int NOT NULL,
  `USUARIO_ID` int NOT NULL,
  `PADRE_ID` int DEFAULT NULL,
  `CONTENIDO` text NOT NULL,
  `FECHA_COMENTARIO` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_COMENTARIO`),
  KEY `IMAGEN_DIA_ID` (`IMAGEN_DIA_ID`),
  KEY `USUARIO_ID` (`USUARIO_ID`),
  KEY `PADRE_ID` (`PADRE_ID`),
  CONSTRAINT `comentario_imagen_dia_ibfk_1` FOREIGN KEY (`IMAGEN_DIA_ID`) REFERENCES `imagen_dia` (`ID_IMAGEN_DIA`),
  CONSTRAINT `comentario_imagen_dia_ibfk_2` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`),
  CONSTRAINT `comentario_imagen_dia_ibfk_3` FOREIGN KEY (`PADRE_ID`) REFERENCES `comentario_imagen_dia` (`ID_COMENTARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dato_curioso_planeta`
--

DROP TABLE IF EXISTS `dato_curioso_planeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dato_curioso_planeta` (
  `ID_DATO` int NOT NULL AUTO_INCREMENT,
  `PLANETA_ID` int NOT NULL,
  `USUARIO_ID` int NOT NULL,
  `DATO` text NOT NULL,
  `FECHA_PUBLICACION` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_DATO`),
  KEY `PLANETA_ID` (`PLANETA_ID`),
  KEY `USUARIO_ID` (`USUARIO_ID`),
  CONSTRAINT `dato_curioso_planeta_ibfk_1` FOREIGN KEY (`PLANETA_ID`) REFERENCES `planeta` (`ID_PLANETA`),
  CONSTRAINT `dato_curioso_planeta_ibfk_2` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `evento_astronomico`
--

DROP TABLE IF EXISTS `evento_astronomico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento_astronomico` (
  `ID_EVENTO` int NOT NULL AUTO_INCREMENT,
  `USUARIO_ID` int DEFAULT NULL,
  `TITULO` varchar(200) NOT NULL,
  `DESCRIPCION` text,
  `FECHA_HORA` datetime NOT NULL,
  PRIMARY KEY (`ID_EVENTO`),
  KEY `USUARIO_ID` (`USUARIO_ID`),
  CONSTRAINT `evento_astronomico_ibfk_1` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favorito_evento`
--

DROP TABLE IF EXISTS `favorito_evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorito_evento` (
  `ID_FAVORITO_EVENTO` int NOT NULL AUTO_INCREMENT,
  `USUARIO_ID` int NOT NULL,
  `EVENTO_ID` int NOT NULL,
  `FECHA_GUARDADO` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_FAVORITO_EVENTO`),
  UNIQUE KEY `uq_fav_evento` (`USUARIO_ID`,`EVENTO_ID`),
  KEY `EVENTO_ID` (`EVENTO_ID`),
  CONSTRAINT `favorito_evento_ibfk_1` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`),
  CONSTRAINT `favorito_evento_ibfk_2` FOREIGN KEY (`EVENTO_ID`) REFERENCES `evento_astronomico` (`ID_EVENTO`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favorito_imagen`
--

DROP TABLE IF EXISTS `favorito_imagen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorito_imagen` (
  `USUARIO_ID` int NOT NULL,
  `IMAGEN_ID` int NOT NULL,
  `FECHA_GUARDADO` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`USUARIO_ID`,`IMAGEN_ID`),
  KEY `IMAGEN_ID` (`IMAGEN_ID`),
  CONSTRAINT `favorito_imagen_ibfk_1` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`),
  CONSTRAINT `favorito_imagen_ibfk_2` FOREIGN KEY (`IMAGEN_ID`) REFERENCES `imagen_nasa` (`ID_IMAGEN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foro`
--

DROP TABLE IF EXISTS `foro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foro` (
  `ID_FORO` int NOT NULL AUTO_INCREMENT,
  `CATEGORIA_ID` int NOT NULL,
  `USUARIO_ID` int NOT NULL,
  `TITULO` varchar(200) NOT NULL,
  `CONTENIDO` text,
  `URL_IMAGEN` varchar(500) DEFAULT NULL,
  `FECHA_CREACION` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_FORO`),
  KEY `CATEGORIA_ID` (`CATEGORIA_ID`),
  KEY `USUARIO_ID` (`USUARIO_ID`),
  CONSTRAINT `foro_ibfk_1` FOREIGN KEY (`CATEGORIA_ID`) REFERENCES `categoria` (`ID_CATEGORIA`),
  CONSTRAINT `foro_ibfk_2` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `imagen_dia`
--

DROP TABLE IF EXISTS `imagen_dia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagen_dia` (
  `ID_IMAGEN_DIA` int NOT NULL AUTO_INCREMENT,
  `URL_IMAGEN` varchar(500) NOT NULL,
  `TITULO` varchar(255) DEFAULT NULL,
  `DESCRIPCION` text,
  `FECHA_PUBLICACION` date NOT NULL,
  PRIMARY KEY (`ID_IMAGEN_DIA`),
  UNIQUE KEY `FECHA_PUBLICACION` (`FECHA_PUBLICACION`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `imagen_nasa`
--

DROP TABLE IF EXISTS `imagen_nasa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagen_nasa` (
  `ID_IMAGEN` int NOT NULL AUTO_INCREMENT,
  `NASA_ID` varchar(100) NOT NULL,
  `URL_IMAGEN` varchar(500) NOT NULL,
  `TITULO` varchar(255) DEFAULT NULL,
  `DESCRIPCION` text,
  `FECHA_CREACION` date DEFAULT NULL,
  `KEYWORDS` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`ID_IMAGEN`),
  UNIQUE KEY `NASA_ID` (`NASA_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `participacion_reto`
--

DROP TABLE IF EXISTS `participacion_reto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participacion_reto` (
  `ID_PARTICIPACION` int NOT NULL AUTO_INCREMENT,
  `RETO_ID` int NOT NULL,
  `USUARIO_ID` int NOT NULL,
  `TITULO` varchar(200) DEFAULT NULL,
  `URL_IMAGEN` varchar(500) NOT NULL,
  `CLOUDINARY_PUBLIC_ID` varchar(255) DEFAULT NULL,
  `LIKES` int NOT NULL DEFAULT '0',
  `FECHA_SUBIDA` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_PARTICIPACION`),
  UNIQUE KEY `uq_una_participacion_por_reto` (`RETO_ID`,`USUARIO_ID`),
  KEY `USUARIO_ID` (`USUARIO_ID`),
  CONSTRAINT `participacion_reto_ibfk_1` FOREIGN KEY (`RETO_ID`) REFERENCES `reto_astrofotografia` (`ID_RETO`),
  CONSTRAINT `participacion_reto_ibfk_2` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `planeta`
--

DROP TABLE IF EXISTS `planeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planeta` (
  `ID_PLANETA` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(50) NOT NULL,
  `MASA_KG` double DEFAULT NULL,
  `RADIO_KM` decimal(12,2) DEFAULT NULL,
  `PERIODO_ORBITAL_DIAS` decimal(12,4) DEFAULT NULL,
  `DISTANCIA_SOL_UA` decimal(10,4) DEFAULT NULL,
  `INCLINACION_AXIAL` decimal(10,4) DEFAULT NULL,
  `TEXTURA_URL` varchar(500) DEFAULT NULL,
  `MODELO_3D_URL` varchar(500) DEFAULT NULL,
  `DESCRIPCION` text,
  `ORDEN_VISUAL` int NOT NULL,
  PRIMARY KEY (`ID_PLANETA`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reto_astrofotografia`
--

DROP TABLE IF EXISTS `reto_astrofotografia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reto_astrofotografia` (
  `ID_RETO` int NOT NULL AUTO_INCREMENT,
  `USUARIO_ID` int NOT NULL COMMENT 'Backend valida que el rol sea DIVULGADOR',
  `TITULO` varchar(200) NOT NULL,
  `DESCRIPCION` text,
  `FECHA_LIMITE` varchar(50) NOT NULL COMMENT 'Texto libre, ej. "20/07/2026"',
  `FECHA_CREACION` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_RETO`),
  KEY `USUARIO_ID` (`USUARIO_ID`),
  CONSTRAINT `reto_astrofotografia_ibfk_1` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `ID_USUARIO` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(150) NOT NULL,
  `EMAIL` varchar(150) NOT NULL,
  `PASSWORD_HASH` varchar(255) NOT NULL,
  `ROL` enum('EXPLORADOR','PARTICIPANTE','DIVULGADOR') NOT NULL DEFAULT 'EXPLORADOR',
  `FECHA_REGISTRO` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_USUARIO`),
  UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `voto_reto`
--

DROP TABLE IF EXISTS `voto_reto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voto_reto` (
  `ID_VOTO` int NOT NULL AUTO_INCREMENT,
  `PARTICIPACION_ID` int NOT NULL,
  `USUARIO_ID` int NOT NULL,
  `PUNTUACION` tinyint NOT NULL COMMENT 'Valor del 1 al 5',
  `FECHA_VOTO` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_VOTO`),
  UNIQUE KEY `uq_un_voto_por_participacion` (`PARTICIPACION_ID`,`USUARIO_ID`),
  KEY `USUARIO_ID` (`USUARIO_ID`),
  CONSTRAINT `voto_reto_ibfk_1` FOREIGN KEY (`PARTICIPACION_ID`) REFERENCES `participacion_reto` (`ID_PARTICIPACION`),
  CONSTRAINT `voto_reto_ibfk_2` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID_USUARIO`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'deepsky'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-19 11:40:12

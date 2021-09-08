USE [VuMaxDR]
GO

/****** Object:  Table [dbo].[eVuMaxUserFavorites]    Script Date: 07-09-2021 16:47:46 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON

DROP TABLE eVuMaxUserFavorites
GO

CREATE TABLE eVuMaxUserFavorites(
	[Id] [varchar](100) NOT NULL,
	[UserID] [varchar](100) NOT NULL,
	[WellID] [varchar](50) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[UserID] ASC,
	[WellID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



USE [VuMaxDR]
GO

/****** Object:  Table [dbo].[eVuMaxUserFavorites]    Script Date: 15-10-2020 17:46:14 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[eVuMaxUserFavorites](
	[Id] [varchar](100) NOT NULL,
	[UserID] [varchar](100) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
 CONSTRAINT [PK_eVuMaxUserFavorites] PRIMARY KEY CLUSTERED 
(
	[Id] ASC,
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



USE [VuMaxDR]
GO
/****** Object:  Table [dbo].[eVuMaxThemeDetails]    Script Date: 3/9/2022 3:20:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[eVuMaxThemeDetails](
	[Id] [varchar](50) NOT NULL,
	[PropertyName] [varchar](200) NULL,
	[Value] [nvarchar](500) NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[eVuMaxThemeHeader]    Script Date: 3/9/2022 3:20:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[eVuMaxThemeHeader](
	[Id] [varchar](50) NOT NULL,
	[Name] [varchar](100) NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
 CONSTRAINT [PK_eVuMaxThemeHeader] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a6', N'WorkArea', N'rgba(228, 224, 224, 1)', N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a6', N'MenuBar', N'rgba(255, 255, 255, 1)', N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a6', N'FontColor', N'rgba(0, 0, 0, 1)', N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime))
GO
INSERT [dbo].[eVuMaxThemeHeader] ([Id], [Name], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a6', N'Default Light ', N'sa', CAST(N'2020-05-25T10:23:13.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime))

GO

select * from eVuMaxThemeHeader
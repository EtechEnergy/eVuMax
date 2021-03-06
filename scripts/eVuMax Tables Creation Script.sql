USE [VuMaxDR]
GO
/****** Object:  Table [dbo].[eVuMaxThemeDetails]    Script Date: 27-05-2020 11:42:47 ******/
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
/****** Object:  Table [dbo].[eVuMaxThemeHeader]    Script Date: 27-05-2020 11:42:47 ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[eVuMaxUserPref]    Script Date: 27-05-2020 11:42:47 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[eVuMaxUserPref](
	[UserId] [varchar](50) NOT NULL,
	[ThemeId] [varchar](50) NOT NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [datetime] NULL,
 CONSTRAINT [PK_eVuMaxUserPref] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a5', N'WorkArea', N'rgba(228, 224, 224, 1)', N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a5', N'MenuBar', N'rgba(255, 255, 255, 1)', N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a5', N'FontColor', N'rgba(0, 0, 0, 1)', N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'5ccfc673-f853-4883-9230-ca454885fbc3', N'WorkArea', N'rgba(45, 44, 49, 1)', N'sa', CAST(N'2020-05-25T15:15:42.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:15:42.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'5ccfc673-f853-4883-9230-ca454885fbc3', N'MenuBar', N'rgba(43, 42, 46, 1)', N'sa', CAST(N'2020-05-25T15:15:42.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:15:42.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'5ccfc673-f853-4883-9230-ca454885fbc3', N'FontColor', N'rgba(228, 228, 230, 1)', N'sa', CAST(N'2020-05-25T15:15:42.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:15:42.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'f6c7eb91-a2eb-4f25-a270-17db95f16b59', N'WorkArea', N'rgba(168, 204, 241, 1)', N'sa', CAST(N'2020-05-26T11:17:26.000' AS DateTime), N'sa', CAST(N'2020-05-26T11:17:26.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'f6c7eb91-a2eb-4f25-a270-17db95f16b59', N'MenuBar', N'rgba(93, 127, 241, 1)', N'sa', CAST(N'2020-05-26T11:17:26.000' AS DateTime), N'sa', CAST(N'2020-05-26T11:17:26.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeDetails] ([Id], [PropertyName], [Value], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'f6c7eb91-a2eb-4f25-a270-17db95f16b59', N'FontColor', N'rgba(16, 15, 15, 1)', N'sa', CAST(N'2020-05-26T11:17:26.000' AS DateTime), N'sa', CAST(N'2020-05-26T11:17:26.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeHeader] ([Id], [Name], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a5', N'Light', N'sa', CAST(N'2020-05-25T10:23:13.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:32:25.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeHeader] ([Id], [Name], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'5ccfc673-f853-4883-9230-ca454885fbc3', N'Dark', N'sa', CAST(N'2020-05-25T10:24:25.000' AS DateTime), N'sa', CAST(N'2020-05-25T15:15:42.000' AS DateTime))
INSERT [dbo].[eVuMaxThemeHeader] ([Id], [Name], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'f6c7eb91-a2eb-4f25-a270-17db95f16b59', N'Test-12', N'sa', CAST(N'2020-05-25T10:26:31.000' AS DateTime), N'sa', CAST(N'2020-05-26T11:17:26.000' AS DateTime))
INSERT [dbo].[eVuMaxUserPref] ([UserId], [ThemeId], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate]) VALUES (N'KULDIP\Kuldip', N'22f7ec47-fc00-4ea9-b69e-c863bc9b96a5', N'sa', CAST(N'2020-05-27T11:11:27.000' AS DateTime), N'sa', CAST(N'2020-05-27T11:11:27.000' AS DateTime))



USE [VuMaxDR]
GO

/****** Object:  Table [dbo].[eVuMaxUserSettings]    Script Date: 15-10-2020 16:38:33 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[eVuMaxUserSettings](
	[UserId] [varchar](100) NOT NULL,
	[SettingsId] [varchar](50) NOT NULL,
	[WellId] [varchar](100) NOT NULL,
	[SettingsData] [ntext] NULL,
	[CreatedBy] [varchar](50) NULL,
	[CreatedDate] [datetime] NULL,
	[ModifiedBy] [varchar](50) NULL,
	[ModifiedDate] [date] NULL,
 CONSTRAINT [PK_evmx_UserSettings] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[SettingsId] ASC,
	[WellId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO



USE [VuMaxDR]
GO

/****** Object:  Table [dbo].[eVuMaxUserFavorites]    Script Date: 07-09-2021 16:47:46 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON


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






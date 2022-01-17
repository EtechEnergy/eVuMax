using Microsoft.VisualBasic;
using Microsoft.VisualBasic.CompilerServices;
//using Microsoft.VisualBasic.CompilerServices;
using System;
using System.IO;


namespace eVuMax.DataBroker.Summary.DrlgStand
{
    public class ADSettings
    {
        public bool IsADActive = false;
        public bool UseSrvAccount = false;
        public string Language = "us_english";
        public string adLog = "";
        public int DBAccessMethod = 0;
        public string SQLVersion = "SQLNCLI11";
        public bool Encrypted = false;

        public void loadSettings()
        {
            try
            {
                adLog = "";
                string filePath = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) + @"\VuMaxDR\Settings.ini";
                adLog = adLog + Constants.vbCrLf + " Reading File: " + filePath;
                if (File.Exists(filePath))
                {
                    var objFile = new StreamReader(filePath);
                    objFile.ReadLine();
                    string strLine = objFile.ReadLine();
                    if (strLine.Contains(":"))
                    {
                        string strValue = strLine.Split(':')[1];
                        if (strValue.Trim().ToLower() == "true")
                        {
                            IsADActive = true;
                            adLog = adLog + Constants.vbCrLf + " Active Directory Integration is On";
                        }
                        else
                        {
                            IsADActive = false;
                            adLog = adLog + Constants.vbCrLf + " Active Directory Integration is Off";
                        }
                    }

                    if (!objFile.EndOfStream)
                    {
                        strLine = objFile.ReadLine();
                        string strValue = strLine.Split(':')[1];
                        if (strValue.Trim().ToLower() == "true")
                        {
                            UseSrvAccount = true;
                            adLog = adLog + Constants.vbCrLf + " Service Account is ON";
                        }
                        else
                        {
                            UseSrvAccount = false;
                            adLog = adLog + Constants.vbCrLf + " Service Account is Off";
                        }
                    }

                    if (!objFile.EndOfStream)
                    {
                        strLine = objFile.ReadLine();
                        string strValue = strLine.Split(':')[1];
                        Language = strValue;
                    }

                    if (!objFile.EndOfStream)
                    {
                        strLine = objFile.ReadLine();
                        string strValue = strLine.Split(':')[1];
                        DBAccessMethod = (int)Math.Round(Conversion.Val(strValue));
                    }

                    if (!objFile.EndOfStream)
                    {
                        strLine = objFile.ReadLine();
                        string strValue = strLine.Split(':')[1];
                        SQLVersion = strValue;
                    }
                    else
                    {
                        SQLVersion = "SQLNCLI11";
                    }

                    if (!objFile.EndOfStream)
                    {
                        strLine = objFile.ReadLine();
                        string strValue = strLine.Split(':')[1];
                        if (strValue.ToLower().Trim() == "true")
                        {
                            Encrypted = true;
                        }
                        else
                        {
                            Encrypted = false;
                        }
                    }
                    else
                    {
                        Encrypted = false;
                    }

                    objFile.Close();
                }
                else
                {
                    adLog = adLog + Constants.vbCrLf + " Couldn't find file " + filePath;
                    IsADActive = true;
                    UseSrvAccount = false;
                    Language = "us_english";
                }
            }
            catch (Exception ex)
            {
                adLog = adLog + Constants.vbCrLf + " Error occured while reading settings. " + ex.Message + ex.StackTrace;
                IsADActive = true;
            }
        }

        public void saveSettings()
        {
            try
            {
                string filePath = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) + @"\VuMaxDR\Settings.ini";
                var objFile = new StreamWriter(filePath, false);
                objFile.WriteLine("[Active Directory]");
                objFile.WriteLine(Operators.AddObject("ADIntegration:", Interaction.IIf(IsADActive == true, "True", "False")));
                objFile.WriteLine(Operators.AddObject("UseServiceAccount:", Interaction.IIf(UseSrvAccount == true, "True", "False")));
                objFile.WriteLine("Language:" + Language);
                objFile.WriteLine("DBAccessMethod:" + DBAccessMethod.ToString());
                objFile.WriteLine("SQLVersion:" + SQLVersion);
                objFile.WriteLine(Operators.AddObject("Encrypted:", Interaction.IIf(Encrypted, "True", "False")));
                objFile.Flush();
                objFile.Close();
            }
            catch (Exception ex)
            {
                adLog = adLog + Constants.vbCrLf + " Error occured while reading settings. " + ex.Message + ex.StackTrace;
                IsADActive = true;
            }
        }
    }
}





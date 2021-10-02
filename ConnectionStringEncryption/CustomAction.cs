using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Deployment.WindowsInstaller;
using System.Configuration;

namespace ConnectionStringEncryption
{
    public class CustomActions
    {
        [CustomAction]
        public static ActionResult EncryptConfig(Session session)
        {
            session.Log("Begin EncryptConfig");

            try
            {
                session["APPCONFIGPATH"] = @"C:\Program Files (x86)\ETECH\eVuMaxAPI\Web.config";
                session["SECTIONTOENCRYPT"] = "connectionStrings";

                var configPath = session["APPCONFIGPATH"];
                session.Log("configPath : " + configPath);

                var sectionToEncrypt = session["SECTIONTOENCRYPT"];
                session.Log("sectionToEncrypt : " + sectionToEncrypt);

                var fileMap = new ExeConfigurationFileMap();
                fileMap.ExeConfigFilename = configPath;
                var configuration = ConfigurationManager.OpenMappedExeConfiguration(fileMap, ConfigurationUserLevel.None);
                ConfigurationSection section = configuration.GetSection(sectionToEncrypt);

                if (!section.SectionInformation.IsProtected)
                {
                    section.SectionInformation.ProtectSection("RsaProtectedConfigurationProvider");
                    section.SectionInformation.ForceSave = true;
                    configuration.Save(ConfigurationSaveMode.Modified);

                }
                session.Log("Successfully Encrypted");
                session.Log("End EncryptConfig");
                return ActionResult.Success;

            }
            catch (Exception ex)
            {

                session.Log("Exception :" + ex.Message.ToString() + ex.StackTrace.ToString() + ex.InnerException.ToString());
                return ActionResult.Failure;
            }



        }


        [CustomAction]
        public static ActionResult EncryptParameters(Session session)
        {
            session.Log("Begin EncryptParameters");

            try
            {

                string DB_SERVER = session["DB_SERVER"];
                string DB_PASSWORD = session["DB_PASSWORD"];
                string DB_USER = session["DB_USER"];

                session["DB_USER"] = CustomActions.EnryptString(DB_USER);
                session["DB_PASSWORD"] = CustomActions.EnryptString(DB_PASSWORD);
                session["DB_SERVER"] = CustomActions.EnryptString(DB_SERVER);



                session.Log("Before Encrypt DB_SERVER : " + DB_SERVER);
                session.Log("Before Encrypt DB_PASSWORD : " + DB_PASSWORD);
                session.Log("Before Encrypt DB_USER : " + DB_USER);


                session.Log("After Encrypt DB_SERVER : " + session["DB_USER"]);
                session.Log("After Encrypt DB_PASSWORD : " + session["DB_PASSWORD"]);
                session.Log("After Encrypt DB_USER : " + session["DB_SERVER"]);


                return ActionResult.Success;



            }
            catch (Exception ex)
            {

                session.Log("Exception :" + ex.Message.ToString() + ex.StackTrace.ToString() + ex.InnerException.ToString());
                return ActionResult.Failure;
            }



        }


        public static string DecryptString(string encrString)
        {
            byte[] b;
            string decrypted;
            try
            {
                b = Convert.FromBase64String(encrString);
                decrypted = System.Text.ASCIIEncoding.ASCII.GetString(b);
            }
            catch (FormatException fe)
            {
                decrypted = "";
            }
            return decrypted;
        }

        public static string EnryptString(string strEncrypted)
        {
            byte[] b = System.Text.ASCIIEncoding.ASCII.GetBytes(strEncrypted);
            string encrypted = Convert.ToBase64String(b);
            return encrypted;
        }

    }
}

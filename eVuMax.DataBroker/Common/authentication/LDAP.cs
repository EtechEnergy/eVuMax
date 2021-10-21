using System;
using System.DirectoryServices;


namespace eVuMax.DataBroker.Common.authentication
{
    public class LDAP
    {
        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();
        string _windowsUserName = "";
        string _password = "";

        public string LastError = "";

        public string WindowsUserName { get => _windowsUserName; set => _windowsUserName = value; }
        public string Password { get => _password; set => _password = value; }


        public LDAP(string pWindowsUserName,string pPassword) {

            try
            {
                this.WindowsUserName = pWindowsUserName;
                this.Password = pPassword;
            }
            catch (Exception ex)
            {

            }
        
        }

        //public bool ValidateActiveDirectoryLogin(string paramUsername, string paramPassword)
        public bool ValidateActiveDirectoryLogin()
        {
            bool Success = false;

            string domain = System.DirectoryServices.ActiveDirectory.Domain.GetComputerDomain().Name;

           DirectoryEntry Entry = new DirectoryEntry("LDAP://" + domain, WindowsUserName, Password);

           DirectorySearcher Searcher = new DirectorySearcher(Entry);
            Searcher.SearchScope = System.DirectoryServices.SearchScope.OneLevel;
            try
            {
                SearchResult Results = Searcher.FindOne();
                Success = !(Results == null);
            }
            catch (Exception ex)
            {
                objLogger.LogMessage(ex.Message + ex.StackTrace);
                LastError = "Exception generated.. Possible cause is : " + ex.StackTrace + ex.Message;
                Success = false;
            }

            return Success;
        }




        //public bool isValidWindowUser()
        //{
        //    try
        //    {
        //        ////Nitin Code
        //       // string domain = System.DirectoryServices.ActiveDirectory.Domain.GetComputerDomain().Name;


        //        var Entry = new System.DirectoryServices.DirectoryEntry("LDAP://localhost:389/" + Environment.UserDomainName, WindowsUserName, Password);


        //        var Searcher = new System.DirectoryServices.DirectorySearcher(Entry);
        //        Searcher.SearchScope = System.DirectoryServices.SearchScope.OneLevel;
        //        try
        //        {

        //            SearchResult Results = Searcher.FindOne();

        //           var Success = Results is object;
        //            if (Success)
        //            {
        //                return true;
        //            }
        //            else
        //            {
        //                return false;
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            LastError = "Exception generated.. Possible cause is : " + ex.StackTrace + ex.Message;
        //            objLogger.LogMessage("isValidWindowUser: " + ex.StackTrace + ex.Message);
        //            return false;
        //        }

        //        return true;
        //    }
        //    catch (Exception ex)
        //    {

        //        LastError = ex.Message;
        //        return false;
        //    }
        //}
        //public  bool isValidLDAPUser() {

        //    try
        //    {

        //        ////Kuldip Code
        //        LdapConnection objldapconn = new LdapConnection(new LdapDirectoryIdentifier((string)null, false, false));
        //        NetworkCredential objnetcred = new NetworkCredential(WindowsUserName, Password, Environment.UserDomainName);
        //        objldapconn.Credential = objnetcred;
        //        objldapconn.AuthType = AuthType.Negotiate;
        //        objldapconn.Bind(objnetcred); // user has authenticated at this point, as the credentials were used to login to the dc.

        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        LastError = ex.Message;
        //        objLogger.LogMessage("isValidDAPUser: " + ex.StackTrace + ex.Message);
        //        return false;
        //    }



        //}


    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Common
{
    public static class ObjectIDFactory
    {
        private static Random objRandom = new Random();

        public static string getShortTextID()
        {
            try
            {
                return objRandom.Next(100000, 999999).ToString();
            }
            catch (Exception ex)
            {
                return objRandom.Next(100000, 999999).ToString();
            }


        }

        public static int getNumericID()
        {
            try
            {
                return objRandom.Next(10000000, 99999999);
            }
            catch (Exception ex)
            {

            }

            return default;
        }

        public static int getShortNumericID()
        {
            try
            {
                return objRandom.Next(100, 999);
            }
            catch (Exception ex)
            {

            }

            return default;
        }

        // 'Returns object ID in the form of xxx-xxx-xxx-xxx format
        public static string getObjectID()
        {
            try
            {
                string part1;
                string part2;
                string part3;
                string part4;
                string part5;
                string objectID;
                part1 = objRandom.Next(100, 999).ToString();
                part2 = objRandom.Next(100, 999).ToString();
                part3 = objRandom.Next(100, 999).ToString();
                part4 = objRandom.Next(100, 999).ToString();
                part5 = objRandom.Next(100, 999).ToString();
                objectID = part1 + "-" + part2 + "-" + part3 + "-" + part4 + "-" + part5;
                return objectID;
            }
            catch (Exception ex)
            {

                return "";
            }
        }

        // 'Returns object ID in the form of xxx-xxx-xxx-xxx format
        public static string getObjectID(string prefix)
        {
            try
            {
                string part1;
                string part2;
                string part3;
                string part4;
                string part5;
                string objectID;
                //Math.Randomize();

                part1 = prefix;
                part2 = objRandom.Next(100, 999).ToString();
                part3 = objRandom.Next(100, 999).ToString();
                part4 = objRandom.Next(100, 999).ToString();
                part5 = objRandom.Next(100, 999).ToString();
                objectID = part1 + "-" + part2 + "-" + part3 + "-" + part4 + "-" + part5;
                return objectID;
            }
            catch (Exception ex)
            {

                return "";
            }


        }
    }
}

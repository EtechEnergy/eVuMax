﻿using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager.Setup
{
    public class UnitsMgr : IBroker
    {
        #region UnitDictionary       
        const string LoadUnitList = "LoadUnitList";
        const string AddUnit = "AddUnit";
        const string EditUnit = "EditUnit";
        const string RemoveUnit = "RemoveUnit";

        #endregion

        #region UnitConversion       
        const string LoadUnitConversionList = "LoadUnitConversionList";
        const string AddUnitConversion = "AddUnitConversion";
        const string EditUnitConversion = "EditUnitConversion";
        const string RemoveUnitConversion = "RemoveUnitConversion";

        #endregion

        #region UnitMappings
        const string LoadUnitMappingList = "LoadUnitMappingList";
        const string RemoveUnitMapping = "RemoveUnitMapping";

        #endregion

        #region UnitConversionProfile
        const string LoadUnitConversionProfile = "LoadUnitConversionProfile";
        const string AddUnitConversionProfile = "AddUnitConversionProfile";
        const string EditUnitConversionProfile = "EditUnitConversionProfile";
        const string RemoveUnitConversionProfile = "RemoveUnitConversionProfile";

        #endregion



//        Public objUnitDictionary As New UnitDictionary
//Public objUnitConversion As New UnitConverter
//    Public objUnitMappingDictionary As New UnitMappingDictionary
//    Public objMappingManager As New mappingManager


        BrokerResponse IBroker.getData(BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                if (paramRequest.Function == LoadUnitList)
                {
                    UnitDictionary objUnitDictionary = new UnitDictionary();
                    objUnitDictionary.loadUnitDictionary(ref paramRequest.objDataService);
                    if (objUnitDictionary.units.Count > 0)
                    {
                        objResponse.RequestSuccessfull = true;
                        objResponse.Response = JsonConvert.SerializeObject(objUnitDictionary);
                        return objResponse;
                    }


                }

                if (paramRequest.Function == LoadUnitConversionList)
                {
                    UnitConverter objUnitConversion = new UnitConverter();
                    objUnitConversion.loadUnitConversions(ref paramRequest.objDataService);
                    
                    if (objUnitConversion.unitConversions.Count > 0)
                    {
                        objResponse.RequestSuccessfull = true;
                        objResponse.Response = JsonConvert.SerializeObject(objUnitConversion);
                        return objResponse;
                    }


                }

                if(paramRequest.Function == LoadUnitMappingList)
                {
                    
                    UnitMappingDictionary objUnitMappingDictionary = new UnitMappingDictionary();
                    objUnitMappingDictionary.loadMappingDictionary(ref paramRequest.objDataService);
                    if(objUnitMappingDictionary.unitMappings.Count > 0)
                    {
                        objResponse.RequestSuccessfull = true;
                        objResponse.Response = JsonConvert.SerializeObject(objUnitMappingDictionary);
                        return objResponse;

                    }

                }


                if (paramRequest.Function == LoadUnitConversionProfile)
                {


                    //Dim objData As DataTable = objDataService.getTable("SELECT PROFILE_ID,PROFILE_NAME FROM VMX_UNIT_PROFILE_HEADER ORDER BY PROFILE_NAME")
                    DataTable objData = new DataTable();

                    objData = paramRequest.objDataService.getTable("SELECT PROFILE_ID,PROFILE_NAME FROM VMX_UNIT_PROFILE_HEADER ORDER BY PROFILE_NAME");

                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objData);
                    return objResponse;
                }


                return new BrokerResponse();
            }
            catch (Exception ex)
            {

                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }
        }




        BrokerResponse IBroker.performTask(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();

            #region UnitDictionary
            if (paramRequest.Function == AddUnit)
            {
                string strObjUnit = "";
                Unit objUnit = new Unit();
                strObjUnit = paramRequest.Parameters.Where(x => x.ParamName.Contains("objUnit")).FirstOrDefault().ParamValue.ToString();
                if (strObjUnit != "")
                {
                    objUnit = JsonConvert.DeserializeObject<Unit>(strObjUnit);
                }


                string LastError = "";
                Unit.addUnit(ref paramRequest.objDataService, objUnit, ref LastError);

                if (LastError != "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    return objResponse;

                }
            }

            if (paramRequest.Function == EditUnit)
            {

                string strObjUnit = "";
                Unit objUnit = new Unit();
                strObjUnit = paramRequest.Parameters.Where(x => x.ParamName.Contains("objUnit")).FirstOrDefault().ParamValue.ToString();
                if (strObjUnit != "")
                {
                    objUnit = JsonConvert.DeserializeObject<Unit>(strObjUnit);
                }


                string LastError = "";
                Unit.updateUnit(ref paramRequest.objDataService, objUnit, ref LastError);

                if (LastError != "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    return objResponse;

                }


            }

            if (paramRequest.Function == RemoveUnit)
            {
                string UnitID = "";

                UnitID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UnitID")).FirstOrDefault().ParamValue.ToString();
                if (UnitID != "")
                {
                    string LastError = "";
                    Unit.removeUnit(ref paramRequest.objDataService, UnitID, ref LastError);

                    if (LastError != "")
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Warnings = LastError;
                        objResponse.Response = LastError;
                        return objResponse;

                    }
                }




            }
            #endregion



            #region UnitConversion 

            if(paramRequest.Function == AddUnitConversion)
            {

                string strUnitConversion = "";
                UnitConversion objUnitConversion = new UnitConversion();
                Unit objUnit = new Unit();
                strUnitConversion = paramRequest.Parameters.Where(x => x.ParamName.Contains("objUnitConversion")).FirstOrDefault().ParamValue.ToString();
                if (strUnitConversion != "")
                {
                    objUnitConversion = JsonConvert.DeserializeObject<UnitConversion>(strUnitConversion);
                }


                string LastError = "";
                ObjectIDFactory objFactoryID = new ObjectIDFactory();
                objUnitConversion.ConversionID = objFactoryID.getObjectID("cnv");
                UnitConversion.addUnitConversion(ref paramRequest.objDataService, objUnitConversion, ref LastError);
                if (LastError != "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    return objResponse;

                }

               
            }


            if (paramRequest.Function == EditUnitConversion)
            {

                string strUnitConversion = "";
                UnitConversion objUnitConversion = new UnitConversion();
                Unit objUnit = new Unit();
                strUnitConversion = paramRequest.Parameters.Where(x => x.ParamName.Contains("objUnitConversion")).FirstOrDefault().ParamValue.ToString();
                if (strUnitConversion != "")
                {
                    objUnitConversion = JsonConvert.DeserializeObject<UnitConversion>(strUnitConversion);
                }


                string LastError = "";
                
                UnitConversion.updateUnitConversion(ref paramRequest.objDataService, objUnitConversion, ref LastError);
                if (LastError != "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    return objResponse;

                }


            }


            if (paramRequest.Function == RemoveUnitConversion)
            {

                string ConversionID = "";
                UnitConversion objUnitConversion = new UnitConversion();
                Unit objUnit = new Unit();
                ConversionID = paramRequest.Parameters.Where(x => x.ParamName.Contains("ConversionID")).FirstOrDefault().ParamValue.ToString();
                

                string LastError = "";

                UnitConversion.removeUnitConversion(ref paramRequest.objDataService, ConversionID, ref LastError);
                if (LastError != "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    return objResponse;

                }


            }


            #endregion




            #region UnitMapping

            if (paramRequest.Function == RemoveUnitMapping)
            {

                string MappingKey = "";
                
                MappingKey = paramRequest.Parameters.Where(x => x.ParamName.Contains("MappingKey")).FirstOrDefault().ParamValue.ToString();
                string LastError = "";

                if (MappingKey != "")
                {
                    UnitMapping.removeMapping(ref paramRequest.objDataService, MappingKey, ref LastError);
                    if (LastError != "")
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Warnings = LastError;
                        objResponse.Response = LastError;
                        return objResponse;

                    }
                }
            }

            #endregion




            #region UnitProfile
            if (paramRequest.Function == AddUnitConversionProfile)
            {

                string strProfile = "";
                UnitProfile objProfile = new UnitProfile();
                
                strProfile = paramRequest.Parameters.Where(x => x.ParamName.Contains("objProfile")).FirstOrDefault().ParamValue.ToString();
                if (strProfile != "")
                {
                    objProfile = JsonConvert.DeserializeObject<UnitProfile>(strProfile);
                }


                string LastError = "";
                ObjectIDFactory objFactoryID = new ObjectIDFactory();
                objProfile.ProfileID = objFactoryID.getObjectID();
                UnitProfile.addProfile(ref paramRequest.objDataService, objProfile, ref LastError);
                if (LastError != "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    return objResponse;

                }


            }


            if (paramRequest.Function == EditUnitConversion)
            {

                string strProfile = "";
                UnitProfile objProfile = new UnitProfile();

                strProfile = paramRequest.Parameters.Where(x => x.ParamName.Contains("objProfile")).FirstOrDefault().ParamValue.ToString();
                if (strProfile != "")
                {
                    objProfile = JsonConvert.DeserializeObject<UnitProfile>(strProfile);
                }


                string LastError = "";

                UnitProfile.updateProfile(ref paramRequest.objDataService, objProfile, ref LastError);
                if (LastError != "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    return objResponse;

                }


            }


            if (paramRequest.Function == RemoveUnitConversion)
            {

                string ProfileID = "";
                UnitConversion objUnitConversion = new UnitConversion();
                
                ProfileID = paramRequest.Parameters.Where(x => x.ParamName.Contains("ProfileID")).FirstOrDefault().ParamValue.ToString();


                string LastError = "";

               if(!UnitProfile.removeProfile(ref paramRequest.objDataService, ProfileID))
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    return objResponse;
                }
                


            }
            #endregion

            objResponse.RequestSuccessfull = true;
            objResponse.Warnings = "";
            objResponse.Response = "";
            return objResponse;

        }
    }


}

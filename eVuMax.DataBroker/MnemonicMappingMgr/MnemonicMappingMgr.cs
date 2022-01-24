using System;

using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker
{
    public class MnemonicMappingMgr: VuMaxDR.Data.Objects.MnemonicMappingMgr
    {
        public string getStdMnemonic(string paramMnemonic)
        {
            try
            {
                paramMnemonic = paramMnemonic.ToUpper();
                foreach (MnemonicMapping objItem in listMappings.Values)
                {
                    if (objItem.SourceMnemonic.ToUpper() == paramMnemonic)
                    {
                        return objItem.Mnemonic;
                    }
                }

                return "";
            }
            catch (Exception ex)
            {
                return "";
            }
        }

    }
}

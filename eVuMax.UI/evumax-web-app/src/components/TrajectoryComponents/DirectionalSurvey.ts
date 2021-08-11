export enum enumDirectionalModel {
    AngleAverage = 0,
    BalancedTangential = 1,
    RadiusOfCurvature = 2,
    MinimumCurvature = 3,
};

export default class DirectionalSurvey {

    // DirectionalSurvey(){

    // }

    public ComputeDirectional(avMagneticDeclination: number, avSurveyModel: enumDirectionalModel, avNumSurveyValues: number, avDirectionDepth: number[], avDirectionDirection: number[], avDirectionalInclination: number[], avTVD: number[]) {
        try {


            let returnValue: any = { avDirectionDepth: [] as number[], avDirectionDirection: [] as number[], avDirectionalInclination: [] as number[], avTVD: [] as number[] };

            let lvDirectionCtr: number;
            let lvPI: number;           //  the trig definition
            let lvDeg2Rad: number;      //  conversion factor
            let lvDeltaX: number;       //  interval change in the x coordinate
            let lvDeltaY: number;       //  interval change in the y coordinate
            let lvDeltaZ: number;       //  interval change in the true vert depth
            let lvLocAzi: number;       //  local azimuth value - temporary only
            let lvPrevAzi: number;      //  local previous azimuth value
            let lvCurrIntv: number;     //  current interval
            let lvCurrRadDev: number;   //  current deviation converted to radians
            let lvCurrRadAzi: number;   //  current azimuth converted to radians
            let lvPrevRadDev: number;   //  previous deviation converted to radians
            let lvPrevRadAzi: number;   //  previous azimuth converted to radians
            let lvSineFactor: number;   //  sine value used in radius of curve mthd
            let lvCosinFactor: number;  //  cos value used in radius of curve methd
            let lvDogLegRad: number;    //  Dogleg Radians
            let lvDogLegDeg: number;    //  Dogleg Degrees
            let lvWork: number;
            let lvSql: string;

            try {
                if ((avNumSurveyValues < 4)) {
                    returnValue = null;
                    return returnValue;
                }
            } catch (error) {

            }


            lvPI = 4.0 * Math.atan(1.0); //  standard geometric constant
            lvDeg2Rad = (lvPI / 180); //degree to radian constant

            let avTVD: any = [avNumSurveyValues];
            avTVD[1] = avDirectionDepth[1];
            for (lvDirectionCtr = 2; (lvDirectionCtr <= avNumSurveyValues); lvDirectionCtr++) {

                lvCurrIntv = (avDirectionDepth[lvDirectionCtr] - avDirectionDepth[(lvDirectionCtr - 1)]);
                lvLocAzi = avDirectionalInclination[lvDirectionCtr];
                lvPrevAzi = avDirectionalInclination[(lvDirectionCtr - 1)];

                //  ADJUST FOR MAGNETIC DECLINATION
                lvLocAzi = (lvLocAzi + avMagneticDeclination);
                lvPrevAzi = (lvPrevAzi + avMagneticDeclination);


                //  CONVERT DEVIATION AND AXIMUTH VALUES TO READIANS
                lvCurrRadDev = (avDirectionalInclination[lvDirectionCtr] * lvDeg2Rad);
                lvPrevRadDev = (avDirectionalInclination[(lvDirectionCtr - 1)] * lvDeg2Rad);
                lvCurrRadAzi = (avDirectionDirection[lvDirectionCtr] * lvDeg2Rad);
                lvPrevRadAzi = (avDirectionDirection[(lvDirectionCtr - 1)] * lvDeg2Rad);


                //  CORRECT FOR VALUES POPPING ON EITHER SIDE OF NORTH
                if (((lvCurrRadAzi - lvPrevRadAzi) < (lvPI * -1))) {
                    lvPrevRadAzi = (lvPrevRadAzi - 2) * lvPI;
                }



                if (((lvCurrRadAzi - lvPrevRadAzi) > lvPI)) {
                    lvPrevRadAzi = (lvPrevRadAzi + 2) * lvPI;
                }



                //  PROCESS DIFFERENT MODELS
                switch (avSurveyModel) {
                    case enumDirectionalModel.AngleAverage:

                        lvDeltaZ = lvCurrIntv * Math.cos((lvPrevRadDev + lvCurrRadDev) / 2.0);
                        break;
                    case enumDirectionalModel.BalancedTangential:

                        lvDeltaZ = lvCurrIntv * ((Math.cos(lvPrevRadDev) + Math.cos(lvCurrRadDev)) / 2.0);
                        break;
                    case enumDirectionalModel.RadiusOfCurvature:
                        lvDeltaZ = lvCurrIntv;
                        if (((lvCurrRadDev - lvPrevRadDev) == 0.0)) {//  no change in dev

                            lvDeltaZ = lvDeltaZ * Math.cos(lvPrevRadDev)
                        }
                        else {
                            //  deviation change so do things differently

                            lvSineFactor = Math.sin(lvPrevRadDev) * Math.sin(lvCurrRadDev - lvPrevRadDev);

                            lvCosinFactor = Math.cos(lvPrevRadDev) * (Math.cos(lvCurrRadDev - lvPrevRadDev) - 1.0);

                            lvDeltaZ = lvDeltaZ * (Math.cos(lvPrevRadDev) * Math.sin(lvCurrRadDev - lvPrevRadDev) + Math.sin(lvPrevRadDev) * (Math.cos(lvCurrRadDev - lvPrevRadDev) - 1.0)) / (lvCurrRadDev - lvPrevRadDev);

                        }

                        break;
                    case enumDirectionalModel.MinimumCurvature:
                        //  compute dogleg severity
                        if ((Math.abs((lvCurrRadDev - lvPrevRadDev)) == 0)) {
                            lvDogLegRad = 0;
                            lvDogLegDeg = 0;
                        }
                        else {

                            lvWork = Math.cos(lvCurrRadDev - lvPrevRadDev) - Math.sin(lvPrevRadDev) * Math.sin(lvCurrRadDev) * (1 - Math.cos(lvCurrRadAzi - lvPrevRadAzi));

                            lvDogLegRad = Math.atan(-lvWork / Math.sqrt(-lvWork * lvWork + 1)) + 1.5708

                            lvDogLegDeg = (lvDogLegRad / lvDeg2Rad);
                        }

                        //  use lvSineFactor variable for factor "F"
                        if ((lvDogLegDeg < 0.25)) {
                            lvSineFactor = 1;
                        }
                        else {

                            lvSineFactor = (2 / lvDogLegRad) * Math.tan(lvDogLegRad / 2)
                        }


                        lvDeltaZ = (lvCurrIntv / 2) * (Math.cos(lvCurrRadDev) + Math.cos(lvPrevRadDev)) * lvSineFactor
                        break;
                }

                //  ASSIGN NEW TVD VALUE

                avTVD[lvDirectionCtr] = avTVD[lvDirectionCtr - 1] + lvDeltaZ
            }

            returnValue.avDirectionDepth = avDirectionDepth;
            returnValue.avDirectionDirection = avDirectionDirection;
            returnValue.avDirectionalInclination = avDirectionalInclination;
            returnValue.avTVD = avTVD;

            return returnValue;
        } catch (error) {

            return null;

        }

    }
}
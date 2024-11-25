"use client";

const Rules: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-6">
      {/* Pealkiri */}
      <h1 className="text-4xl font-bold mb-6 text-center text-orange-500">
        Perudo Palace Reeglid
      </h1>
      
      {/* Reeglite konteiner */}
      <div className="max-w-4xl w-full bg-gray-900 p-8 rounded-md shadow-lg space-y-6 text-orange-400">
        <p className="text-lg text-center">
         Perudo Palace on täringumäng, mis põhineb bluffimisel ja strateegial.
          Mängijad teevad oletusi selle kohta, mitu konkreetse väärtusega täringut on kõigi mängijate seas kokku.
        </p>

        {/* Reeglite jaotised */}
        <div className="space-y-4">
          {/* Mängijad ja varustus */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Mängijad ja varustus
            </h2>
            <ul className="list-disc list-inside">
              <li>Mängijaid: 2–4.</li>
              <li>Igal mängijal on: 4 täringut ja tops, millega täringuid varjata.</li>
            </ul>
          </div>

          {/* Mängu eesmärk */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Mängu eesmärk
            </h2>
            <p>
              Olla viimane mängija, kellel on veel elud alles. Mäng lõppeb, kui kõik teised mängijad kaotavad oma viimase elu (südame).
            </p>
          </div>

          {/* Mängu algus */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Mängu algus
            </h2>
            <ol className="list-decimal list-inside">
              <li>
                Kõik mängijad loksutavad oma täringuid topsi sees ja asetavad selle tagurpidi lauale, nii et teised mängijad ei näe tulemusi.
              </li>
              <li>
                Iga mängija saab vaadata oma täringutulemusi, kuid peab hoidma need teiste eest saladuses.
              </li>
            </ol>
          </div>

          {/* Pakkumine */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Pakkumine
            </h2>
            <p>
              Mäng algab esimese mängija pakkumisega. Ta ennustab, mitu konkreetset täringut (nt "nelja") kõigi mängijate täringutel kokku on.
            </p>
            <ul className="list-disc list-inside">
              <li>
                Näide: "Kolm nelja" tähendab, et mängija usub, et vähemalt kolm nelja on kõigi täringute peal kokku.
              </li>
              <li>Pakkumine peab olema suurem kui eelmine pakkumine.</li>
              <li>
                Näide: Kui eelmine pakkumine oli "kolm nelja", peab järgmine pakkumine olema kas "neli nelja" või näiteks "kolm viite".
              </li>
            </ul>
          </div>

          {/* Kutsumine ("Call Bluff") */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Kutsumine ("Call Bluff")
            </h2>
            <p>
              Kui mängija ei usu eelmist pakkumist, võib ta öelda: "Vale!" vajutades mõõgale (challange). Seejärel kõik mängijad paljastavad oma täringutulemused.
            </p>
            <ul className="list-disc list-inside">
              <li>
                Kui pakkumine oli tõene (täringute arv vastas või ületas pakkumist), kaotab kutsuja ühe elu.
              </li>
              <li>
                Kui pakkumine oli vale (täringute arv oli väiksem), kaotab pakkumise teinud mängija ühe elu.
              </li>
            </ul>
          </div>

          {/* Jätkamine */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Jätkamine
            </h2>
            <ul className="list-disc list-inside">
              <li>Kaotanud mängija alustab järgmist ringi uue pakkumisega.</li>
              <li>Kui mängijal pole enam elusid, on ta mängust väljas.</li>
            </ul>
          </div>

          {/* Erireegel: Ühed ("Wild Ones") */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Erireegel: Ühed ("Wild Ones")
            </h2>
            <p>
              "1" täringut loetakse jokkeriks ja see loeb igasse pakkumisse.
            </p>
            <p>
              Näiteks: Kui pakkumine oli "kolm nelja" ja tulemus oli "2 nelja ja 1 üks", loetakse see vastavaks.
            </p>
          </div>

          {/* Lõpp ja võitja */}
          <div>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Lõpp ja võitja
            </h2>
            <p>
              Mäng jätkub, kuni üks mängija on alles jäänud oma eludega. Tema on võitja!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;

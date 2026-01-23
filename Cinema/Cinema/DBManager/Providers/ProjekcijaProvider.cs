using Cinema.DBManager.Entities;

namespace Cinema.DBManager.Providers
{
    public class ProjekcijaProvider
    {
        public List<Projekcija> GetAllProjections(string bioskopID)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                if (session == null) return null;

                List<Projekcija> projekcije = new List<Projekcija>();
                var data = session.Execute($"select * from \"Projekcija\" where \"BioskopID\" = '{bioskopID}'");
                foreach(var d in data)
                {
                    Projekcija projekcija = new Projekcija
                    {
                        ID = d["ID"] != null ? d["ID"].ToString() : String.Empty,
                        FilmID = d["FilmID"] != null ? d["FilmID"].ToString() : String.Empty,
                        BioskopID = d["BioskopID"] != null ? d["BioskopID"].ToString() : String.Empty,
                        BrojSale = d["BrojSale"] != null ? Convert.ToInt32(d["BrojSale"]) : 0,
                        BrojMesta = d["BrojMesta"] != null ? Convert.ToInt32(d["BrojMesta"]) : 0,
                        BrojRezervacija = d["BrojRezervacija"] != null ? Convert.ToInt32(d["BrojRezervacija"]) : 0,
                        NazivFilma = d["NazivFilma"] != null ? d["NazivFilma"].ToString() : String.Empty,
                        Slika = d["Slika"] != null ? d["Slika"].ToString() : String.Empty,
                        Vreme = d["Vreme"] != null ? d.GetValue<DateTime>("Vreme") : new DateTime()
                    };
                    projekcije.Add(projekcija);
                }
                return projekcije;
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        public bool InsertProjection(Projekcija projekcija)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                if (session == null) return false;

                var insert = session.Prepare(
                    "INSERT INTO \"Projekcija\" " +
                    "(\"ID\", \"FilmID\", \"BioskopID\", \"BrojSale\", \"BrojMesta\", \"BrojRezervacija\", \"NazivFilma\", \"Slika\", \"Vreme\") " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) IF NOT EXISTS"
                );

                var bound = insert.Bind(
                    projekcija.ID,
                    projekcija.FilmID,
                    projekcija.BioskopID,
                    projekcija.BrojSale,
                    projekcija.BrojMesta,
                    projekcija.BrojRezervacija,
                    projekcija.NazivFilma,
                    projekcija.Slika,
                    projekcija.Vreme
                );

                var res = session.Execute(bound);

                bool applied = res.First().GetValue<bool>("[applied]");
                return applied;
            }
            catch(Exception ex)
            {
                return false;
            }
        }

        public bool UpdateProjection(Projekcija projekcija)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                if (session == null) return false;

                var update = session.Prepare(
                    "update \"Projekcija\" set" +
                    "\"FilmID\" = ?, " +
                    "\"BrojSale\" = ?, " +
                    "\"BrojMesta\" = ?, " +
                    "\"BrojRezervacija\" = ?, " +
                    "\"Vreme\" = ?, " +
                    "\"NazivFilma\" = ?, " +
                    "\"Slika\" = ? " +
                    "where \"BioskopID\" = ? and \"ID\" = ? IF EXISTS"
                );
                var res = session.Execute(
                    update.Bind(
                        projekcija.FilmID,
                        projekcija.BrojSale,
                        projekcija.BrojMesta,
                        projekcija.BrojRezervacija,
                        projekcija.Vreme,
                        projekcija.NazivFilma,
                        projekcija.Slika,
                        projekcija.BioskopID,
                        projekcija.ID
                    )
                );
                bool applied = res.First().GetValue<bool>("[applied]");
                return applied;
            }
            catch(Exception ex)
            {
                return false;
            }
        }

        public bool DeleteProjection(string bioskopID, string ID)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                if (session == null) return false;
                
                var data = session.Execute($"select * from \"Projekcija\" where \"BioskopID\" = '{bioskopID}' and \"ID\" = '{ID}'");
                var res = data.FirstOrDefault();
                if(res == null) return false;

                session.Execute($"DELETE FROM \"Projekcija\" WHERE \"BioskopID\" = '{bioskopID}' and \"ID\" = '{ID}'");

                data = session.Execute($"select * from \"Projekcija\" where \"BioskopID\" = '{bioskopID}' and \"ID\" = '{ID}'");
                res = data.FirstOrDefault();

                if(res == null) return true;
                else return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}
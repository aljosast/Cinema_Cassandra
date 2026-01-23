using System.Runtime.Versioning;
using Cinema.DBManager.Entities;

namespace Cinema.DBManager.Providers
{
    public class BioskopProvider
    {
        public List<Bioskop> GetAllCinemas()
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                List<Bioskop> bioskopi = new List<Bioskop>();

                if (session == null) return null;

                var data = session.Execute("select * from \"Bioskop\"");

                foreach(var d in data)
                {
                    Bioskop bioskop = new Bioskop();
                    bioskop.ID = d["ID"] != null ? d["ID"].ToString() : String.Empty;
                    bioskop.Naziv = d["Naziv"] != null ? d["Naziv"].ToString() : String.Empty;
                    bioskop.Grad = d["Grad"] != null ? d["Grad"].ToString() : String.Empty;
                    bioskop.Adresa = d["Adresa"] != null ? d["Adresa"].ToString() : String.Empty;

                    List<Projekcija> projekcije = new List<Projekcija>();
                    var projData = session.Execute($"select * from \"Projekcija\" where \"BioskopID\" = '{bioskop.ID}'");

                    foreach(var pd in projData)
                    {
                        Projekcija projekcija = new Projekcija();
                        projekcija.ID = pd["ID"] != null ? pd["ID"].ToString() : String.Empty;
                        projekcija.FilmID = pd["FilmID"] != null ? pd["FilmID"].ToString() : String.Empty;
                        projekcija.BioskopID = pd["BioskopID"] != null ? pd["BioskopID"].ToString() : String.Empty;
                        projekcija.BrojSale = pd["BrojSale"] != null ? Convert.ToInt32(pd["BrojSale"]) : 0;
                        projekcija.BrojMesta = pd["BrojMesta"] != null ? Convert.ToInt32(pd["BrojMesta"]) : 0;
                        projekcija.BrojRezervacija = pd["BrojRezervacija"] != null ? Convert.ToInt32(pd["BrojRezervacija"]) : 0;
                        projekcija.NazivFilma = pd["NazivFilma"] != null ? pd["NazivFilma"].ToString() : String.Empty;
                        projekcija.Slika = pd["Slika"] != null ? pd["Slika"].ToString() : String.Empty;
                        //projekcija.Vreme = pd["Vreme"] != null ? Convert.ToDateTime(pd["Vreme"]) : new DateTime();
                        projekcija.Vreme = pd["Vreme"] != null ? pd.GetValue<DateTime>("Vreme") : new DateTime();
                        projekcije.Add(projekcija);
                    }
                    bioskop.Projekcije = projekcije;
                    bioskopi.Add(bioskop);
                }
                return bioskopi;
            }
            catch(Exception ex)
            {
                return null;
            }
        }

        public List<Bioskop> GetAllCinemas(string grad)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                List<Bioskop> bioskopi = new List<Bioskop>();

                if (session == null) return null;

                var data = session.Execute($"select * from \"Bioskop\" where \"Grad\" = '{grad}'");

                foreach(var d in data)
                {
                    Bioskop bioskop = new Bioskop();
                    bioskop.ID = d["ID"] != null ? d["ID"].ToString() : String.Empty;
                    bioskop.Naziv = d["Naziv"] != null ? d["Naziv"].ToString() : String.Empty;
                    bioskop.Grad = d["Grad"] != null ? d["Grad"].ToString() : String.Empty;
                    bioskop.Adresa = d["Adresa"] != null ? d["Adresa"].ToString() : String.Empty;

                    List<Projekcija> projekcije = new List<Projekcija>();
                    var projData = session.Execute($"select * from \"Projekcija\" where \"BioskopID\" = '{bioskop.ID}'");

                    foreach(var pd in projData)
                    {
                        Projekcija projekcija = new Projekcija();
                        projekcija.ID = pd["ID"] != null ? pd["ID"].ToString() : String.Empty;
                        projekcija.FilmID = pd["FilmID"] != null ? pd["FilmID"].ToString() : String.Empty;
                        projekcija.BioskopID = pd["BioskopID"] != null ? pd["BioskopID"].ToString() : String.Empty;
                        projekcija.BrojSale = pd["BrojSale"] != null ? Convert.ToInt32(pd["BrojSale"]) : 0;
                        projekcija.BrojMesta = pd["BrojMesta"] != null ? Convert.ToInt32(pd["BrojMesta"]) : 0;
                        projekcija.BrojRezervacija = pd["BrojRezervacija"] != null ? Convert.ToInt32(pd["BrojRezervacija"]) : 0;
                        projekcija.NazivFilma = pd["NazivFilma"] != null ? pd["NazivFilma"].ToString() : String.Empty;
                        projekcija.Slika = pd["Slika"] != null ? pd["Slika"].ToString() : String.Empty;
                        projekcija.Vreme = pd["Vreme"] != null ? Convert.ToDateTime(pd["Vreme"]) : new DateTime();
                        //projekcija.Vreme = pd["Vreme"] != null ? pd.GetValue<DateTime>("Vreme") : new DateTime();
                        projekcije.Add(projekcija);
                    }
                    bioskop.Projekcije = projekcije;
                    bioskopi.Add(bioskop);
                }
                return bioskopi;
            }
            catch(Exception ex)
            {
                return null;
            }
        }
        public List<string> GetAllCities()
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                List<string> gradovi = new List<string>();

                if (session == null) return null;

                var data = session.Execute($"select distinct \"Grad\" from \"Bioskop\"");

                foreach(var d in data)
                {
                    if(d["Grad"] != null)
                        gradovi.Add(d["Grad"].ToString());
                }
                return gradovi;

            }
            catch(Exception ex)
            {
                return null;
            }
        }
        public bool InsertCinema(Bioskop bioskop)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                if (session == null) return false;

                var res = session.Execute("insert into \"Bioskop\" (\"ID\", \"Naziv\", \"Grad\", \"Adresa\")" + 
                $"values ('{bioskop.ID}', '{bioskop.Naziv}', '{bioskop.Grad}', '{bioskop.Adresa}') IF NOT EXISTS");

                bool aplied = res.First().GetValue<bool>("[applied]");
                return aplied;
            }
            catch(Exception ex)
            {
                return false;
            }
        }
        public bool UpdateCinema(Bioskop bioskop)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                if (session == null) return false;

                var res = session.Execute($"select * from \"Bioskop\" where \"Grad\" = '{bioskop.Grad}' and \"ID\" = '{bioskop.ID}'");
                var row = res.FirstOrDefault();

                Bioskop cinema = new Bioskop
                {
                    ID = row["ID"].ToString(),
                    Naziv = row["Naziv"].ToString(),
                    Grad = row["Grad"].ToString(),
                    Adresa = row["Adresa"].ToString()
                };

                if(cinema.Naziv != bioskop.Naziv)
                    session.Execute($"update \"Bioskop\" set \"Naziv\" = '{bioskop.Naziv}' where \"Grad\" = '{bioskop.Grad}' and \"ID\" = '{bioskop.ID}'");
                if(cinema.Adresa != bioskop.Adresa)
                    session.Execute($"update \"Bioskop\" set \"Adresa\" = '{bioskop.Adresa}' where \"Grad\" = '{bioskop.Grad}' and \"ID\" = '{bioskop.ID}'");
                return true;
            }
            catch(Exception ex)
            {
                return false;
            }
        }
        public bool DeleteCinema(string grad, string id)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();

                if (session == null)
                    return false;
                
                var data = session.Execute($"select * from \"Bioskop\" where \"Grad\" = '{grad}' and \"ID\" = '{id}'");
                var res = data.FirstOrDefault();
                if(res == null) return false;

                session.Execute($"DELETE FROM \"Bioskop\" WHERE \"Grad\" = '{grad}' and \"ID\" = '{id}'");
                session.Execute($"DELETE FROM \"Projekcija\" WHERE \"BioskopID\" = '{id}'");

                data = session.Execute($"select * from \"Bioskop\" where \"Grad\" = '{grad}' and \"ID\" = '{id}'");
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
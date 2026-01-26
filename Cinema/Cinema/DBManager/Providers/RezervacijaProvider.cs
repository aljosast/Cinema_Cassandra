using Cassandra;
using Cinema.Controllers.DTO;
using Cinema.DBManager.Entities;

namespace Cinema.DBManager.Providers
{
    public class RezervacijaProvider
    {
        public DBResponse InsertReservation(Rezervacija rezervacija)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                if (session == null) return new DBResponse { Success = false, Message = "Neuspela sesija" };

                var id = Guid.NewGuid().ToString();

                // 1. INSERT REZERVACIJE
                var statement = session.Prepare(
                    "INSERT INTO \"Rezervacija\" " +
                    "(\"ID\", \"Username\", \"ProjekcijaID\", \"NazivFilma\", \"NazivBioskopa\", \"AdresaBioskopa\", \"VremeProjekcije\", \"UkupnaCena\", \"BrojMesta\", \"BioskopID\") " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "IF NOT EXISTS"
                );

                var result = session.Execute(statement.Bind(
                    id,
                    rezervacija.Username,
                    rezervacija.ProjekcijaID,
                    rezervacija.NazivFilma,
                    rezervacija.NazivBioskopa,
                    rezervacija.AdresaBioskopa,
                    rezervacija.VremeProjekcije,
                    rezervacija.UkupnaCena,
                    rezervacija.BrojMesta,
                    rezervacija.BioskopID
                ));

                bool applied = result.First().GetValue<bool>("[applied]");

                // 2. UPDATE PROJEKCIJE (Read -> Calculate -> Write)
                if (applied)
                {
                    try
                    {
                        // A. Pročitaj trenutno stanje
                        var selectProj = session.Prepare(
                            "SELECT \"BrojRezervacija\" FROM \"Projekcija\" WHERE \"BioskopID\" = ? AND \"ID\" = ?"
                        );
                        var projRow = session.Execute(selectProj.Bind(rezervacija.BioskopID, rezervacija.ProjekcijaID)).FirstOrDefault();

                        if (projRow != null)
                        {
                            int trenutno = projRow.GetValue<int>("BrojRezervacija");
                            int novoStanje = trenutno + rezervacija.BrojMesta; // Dodajemo mesta

                            // B. Sačuvaj novo stanje
                            var updateProj = session.Prepare(
                                "UPDATE \"Projekcija\" SET \"BrojRezervacija\" = ? " +
                                "WHERE \"BioskopID\" = ? AND \"ID\" = ?"
                            );

                            session.Execute(updateProj.Bind(novoStanje, rezervacija.BioskopID, rezervacija.ProjekcijaID));
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Greška pri update-u projekcije: " + ex.Message);
                    }
                }

                return new DBResponse
                {
                    Success = applied,
                    Message = applied ? "Rezervacija uspešna!" : "Greška."
                };
            }
            catch (Exception ex)
            {
                return new DBResponse { Success = false, Message = ex.Message };
            }
        }

        public DBResponse DeleteReservation(string username, string rezervacijaID)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                if (session == null) return new DBResponse { Success = false, Message = "Neuspela sesija" };

                // 1. PRVO PROČITAJ PODATKE (da znamo šta vraćamo)
                var readStmt = session.Prepare("SELECT \"BioskopID\", \"ProjekcijaID\", \"BrojMesta\" FROM \"Rezervacija\" WHERE \"Username\" = ? AND \"ID\" = ?");
                var row = session.Execute(readStmt.Bind(username, rezervacijaID)).FirstOrDefault();

                if (row != null)
                {
                    string bioskopID = row.GetValue<string>("BioskopID");
                    string projID = row.GetValue<string>("ProjekcijaID");
                    int mestaZaVracanje = row.GetValue<int>("BrojMesta");

                    // 2. OBRIŠI REZERVACIJU
                    var delStmt = session.Prepare("DELETE FROM \"Rezervacija\" WHERE \"Username\" = ? AND \"ID\" = ? IF EXISTS");
                    var result = session.Execute(delStmt.Bind(username, rezervacijaID));
                    bool applied = result.First().GetValue<bool>("[applied]");

                    // 3. VRATI MESTA U PROJEKCIJU (Read -> Calculate -> Write)
                    if (applied && !string.IsNullOrEmpty(bioskopID))
                    {
                        try
                        {
                            // A. Pročitaj trenutno stanje projekcije
                            var selectProj = session.Prepare("SELECT \"BrojRezervacija\" FROM \"Projekcija\" WHERE \"BioskopID\" = ? AND \"ID\" = ?");
                            var projRow = session.Execute(selectProj.Bind(bioskopID, projID)).FirstOrDefault();

                            if (projRow != null)
                            {
                                int trenutno = projRow.GetValue<int>("BrojRezervacija");
                                int novoStanje = trenutno - mestaZaVracanje; // Oduzimamo rezervacije (vraćamo mesta)
                                if (novoStanje < 0) novoStanje = 0; // Zaštita

                                // B. Sačuvaj novo stanje
                                var updateProj = session.Prepare("UPDATE \"Projekcija\" SET \"BrojRezervacija\" = ? WHERE \"BioskopID\" = ? AND \"ID\" = ?");
                                session.Execute(updateProj.Bind(novoStanje, bioskopID, projID));
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Greška pri vraćanju mesta: " + ex.Message);
                        }
                    }

                    return new DBResponse { Success = applied, Message = applied ? "Obrisano" : "Greška" };
                }

                return new DBResponse { Success = false, Message = "Rezervacija nije pronađena" };
            }
            catch (Exception ex)
            {
                return new DBResponse { Success = false, Message = ex.Message };
            }
        }

        public List<Rezervacija> GetAllReservation(string username)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                List<Rezervacija> rezervacije = new List<Rezervacija>();

                if (session == null) return null;

                var statement = session.Prepare("select * from \"Rezervacija\" where \"Username\" = ?");
                var Data = session.Execute(statement.Bind(username));

                foreach (var res in Data)
                {
                    Rezervacija rezervacija = new Rezervacija();
                    rezervacija.ID = res["ID"] != null ? res["ID"].ToString() : String.Empty;
                    rezervacija.Username = res["Username"] != null ? res["Username"].ToString() : String.Empty;
                    rezervacija.ProjekcijaID = res["ProjekcijaID"] != null ? res["ProjekcijaID"].ToString() : String.Empty;
                    rezervacija.NazivFilma = res["NazivFilma"] != null ? res["NazivFilma"].ToString() : String.Empty;
                    rezervacija.NazivBioskopa = res["NazivBioskopa"] != null ? res["NazivBioskopa"].ToString() : String.Empty;
                    rezervacija.AdresaBioskopa = res["AdresaBioskopa"] != null ? res["AdresaBioskopa"].ToString() : String.Empty;
                    rezervacija.VremeProjekcije = res["VremeProjekcije"] != null ? res.GetValue<DateTime>("VremeProjekcije") : DateTime.UtcNow;
                    rezervacija.UkupnaCena = res["UkupnaCena"] != null ? Convert.ToInt32(res["UkupnaCena"]) : 0;
                    rezervacija.BrojMesta = res["BrojMesta"] != null ? Convert.ToInt32(res["BrojMesta"]) : 0;
                    
                    // Dodajemo i BioskopID ako postoji u bazi
                    if (res.GetColumn("BioskopID") != null)
                        rezervacija.BioskopID = res["BioskopID"] != null ? res["BioskopID"].ToString() : String.Empty;

                    rezervacije.Add(rezervacija);
                }

                return rezervacije;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
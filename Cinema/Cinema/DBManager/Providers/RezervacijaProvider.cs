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

                if (session == null)
                    return new DBResponse
                    {
                        Success = false,
                        Message = "Neuspela sesija"
                    };

                var id = Guid.NewGuid().ToString();

                var statement = session.Prepare(
                    "INSERT INTO \"Rezervacija\" " +
                    "(\"ID\", \"Username\", \"ProjekcijaID\", \"NazivFilma\", \"NazivBioskopa\", \"AdresaBioskopa\", \"VremeProjekcije\") " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)" +
                    "IF NOT EXISTS"
                );

                var result = session.Execute(statement.Bind(
                    id,
                    rezervacija.Username,
                    rezervacija.ProjekcijaID,
                    rezervacija.NazivFilma,
                    rezervacija.NazivBioskopa,
                    rezervacija.AdresaBioskopa,
                    rezervacija.VremeProjekcije
                ));

                bool applied = result.First().GetValue<bool>("[applied]");

                return new DBResponse
                {
                    Success = applied,
                    Message = "Odgovor baze"
                };
            }
            catch (Exception ex)
            {
                return new DBResponse
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        public DBResponse DeleteReservation(string username,string rezervacija)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();

                if (session == null)
                    return new DBResponse
                    {
                        Success = false,
                        Message = "Neuspela sesija"
                    };

                var stmt = session.Prepare(
                    "DELETE FROM \"Rezervacija\" " +
                    "WHERE \"Username\" = ? AND \"ID\" = ? IF EXISTS;"
                );

                var result = session.Execute(stmt.Bind(
                    username,
                    rezervacija
                ));

                bool applied = result.First().GetValue<bool>("[applied]");

                return new DBResponse
                {
                    Success = applied,
                    Message = "Odgovor baze"
                };
            }
            catch (Exception ex)
            {
                return new DBResponse
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        public List<Rezervacija> GetAllReservation(string username)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                List<Rezervacija>rezervacije = new List<Rezervacija>();

                if (session == null)
                    return null;

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

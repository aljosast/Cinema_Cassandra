using Cinema.Controllers.DTO;
using Cinema.DBManager.Entities;
using Newtonsoft.Json.Linq;

namespace Cinema.DBManager.Providers
{
    public class KorisnikProvider
    {

        public KorisnikDTO UserData(String username)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                KorisnikDTO k = new KorisnikDTO();
                k.Username = username;

                if (session == null)
                    return null;

                var statement = session.Prepare(
                       "SELECT \"Ime\",\"Prezime\",\"Godine\" FROM \"Korisnik\" WHERE \"Username\" = ?"
                );

                var KorisnikData = session.Execute(statement.Bind(username));
                
                var res = KorisnikData.FirstOrDefault();
                if (res == null) return null;

                k.Ime = res["Ime"] != null ? res["Ime"].ToString() : String.Empty;
                k.Prezime = res["Prezime"] != null ? res["Prezime"].ToString() : String.Empty;
                k.Godine = res["Godine"] != null ? Convert.ToInt32(res["Godine"]) : 0;

                return k;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public KorisnikDTO UserBasics(String username)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                KorisnikDTO k = new KorisnikDTO();
                k.Username = username;

                if (session == null)
                    return null;

                var statement = session.Prepare(
                       "SELECT \"Ime\",\"Prezime\",\"Godine\" FROM \"Korisnik\" WHERE \"Username\" = ?"
                );

                var KorisnikData = session.Execute(statement.Bind(username));

                var res = KorisnikData.FirstOrDefault();
                if (res == null) return null;

                k.Ime = res["Ime"] != null ? res["Ime"].ToString() : String.Empty;
                k.Prezime = res["Prezime"] != null ? res["Prezime"].ToString() : String.Empty;
                k.Godine = res["Godine"] != null ? Convert.ToInt32(res["Godine"]) : 0;

                return k;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public DBResponse InsertUser(Korisnik user)
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

                var Password = BCrypt.Net.BCrypt.HashPassword(user.Password, workFactor: 11);

                var statement = session.Prepare(
                    "INSERT INTO \"Korisnik\" " +
                    "(\"Username\", \"Ime\", \"Prezime\", \"Godine\", \"Password\", \"Role\") " +
                    "VALUES (?, ?, ?, ?, ?, ?)" +
                    "IF NOT EXISTS"
                );

                var result = session.Execute(statement.Bind(
                    user.Username,
                    user.Ime,
                    user.Prezime,
                    user.Godine,     
                    Password,        
                    "user"
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

        public TokenData ConfirmUser(LoginData login)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();

                if (session == null)
                    return null;

                TokenData token = new TokenData();

                var statement = session.Prepare(
                       "SELECT \"Password\",\"Role\" FROM \"Korisnik\" WHERE \"Username\" = ?"
                );

                var KorisnikData = session.Execute(statement.Bind(login.Username));

                var res = KorisnikData.FirstOrDefault();
                if (res == null)
                {
                    token.IsAuthenticated = false;
                    token.InvalidMessage = "Korisnicko ime nije pronadjeno";
                    return token;
                }

                string password = res["Password"] != null ? res["Password"].ToString() : String.Empty;
                string role = res["Role"] != null ? res["Role"].ToString() : String.Empty;

                bool isValid = BCrypt.Net.BCrypt.Verify(login.Password,password);

                if (!isValid)
                {
                    token.IsAuthenticated = false;
                    token.InvalidMessage = "Lozinka se ne podudara";
                    return token;
                }

                token.IsAuthenticated = true;
                token.Username = login.Username;
                token.Role = role;

                return token;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        public List<Korisnik> GetAllUsers()
            {
                var session = SessionManager.GetSession();
                if (session == null) return new List<Korisnik>();

                // Selektujemo sve
                var rows = session.Execute("SELECT * FROM \"Korisnik\"");
                
                List<Korisnik> korisnici = new List<Korisnik>();
                foreach (var row in rows)
                {
                    korisnici.Add(new Korisnik
                    {
                        Username = row.GetValue<string>("Username"),
                        Ime = row.GetValue<string>("Ime"),
                        Prezime = row.GetValue<string>("Prezime"),
                        Godine = row.GetValue<int>("Godine"),
                        Role = row.GetValue<string>("Role")
                    });
                }
                return korisnici;
            }

        public DBResponse EditUser(KorisnikDTO user)
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

                var statement = session.Prepare(
                    "UPDATE \"Korisnik\" " +
                    "SET \"Ime\" = ?, \"Prezime\" = ?, \"Godine\" = ? " +
                    "WHERE \"Username\" = ?" +
                    "IF EXISTS"
                );

                var result = session.Execute(statement.Bind(
                    user.Ime,
                    user.Prezime,
                    user.Godine,
                    user.Username
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



        public DBResponse EditPassword(string username, string oldPassword, string newPassword)
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
                
                var statement1 = session.Prepare(
                       "SELECT \"Password\" FROM \"Korisnik\" WHERE \"Username\" = ?"
                );

                var KorisnikData = session.Execute(statement1.Bind(username));

                var res = KorisnikData.FirstOrDefault();
                if (res == null) return new DBResponse
                {
                    Success = false,
                    Message = "Korisnicko ime ne pronadjeno"
                };

                string password = res["Password"] != null ? res["Password"].ToString() : String.Empty;

                bool isValid = BCrypt.Net.BCrypt.Verify(oldPassword, password);

                if (!isValid)
                {
                    return new DBResponse
                    {
                        Success = false,
                        Message = "Nevalidna lozinka"
                    };
                }

                var Password = BCrypt.Net.BCrypt.HashPassword(newPassword, workFactor: 11);

                var statement = session.Prepare(
                    "UPDATE \"Korisnik\" " +
                    "SET \"Password\" = ? " +
                    "WHERE \"Username\" = ?" +
                    "IF EXISTS"
                );

                    var result = session.Execute(statement.Bind(
                    Password,
                    username
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

        public DBResponse DeletetUser(string username)
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
                "DELETE FROM \"Korisnik\" WHERE \"Username\" = ? IF EXISTS");

                var result = session.Execute(stmt.Bind(username));

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
    }
}

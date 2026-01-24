using Cinema.Controllers.DTO;
using Cinema.DBManager.Entities;

namespace Cinema.DBManager.Providers
{
    public class FilmProvider
    {
        public List<Film> GetAllMovies(int page = 0)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();
                List<Film> filmovi = new List<Film>();

                if (session == null)
                    return null;

                var filmsData = session.Execute("select * from \"Filmovi\"").Skip(page * 12).Take(12);

                foreach (var filmData in filmsData)
                {
                    Film film = new Film();
                    film.ID = filmData["ID"] != null ? filmData["ID"].ToString() : String.Empty;
                    film.Naziv = filmData["Naziv"] != null ? filmData["Naziv"].ToString() : String.Empty;
                    film.Opis = filmData["Opis"] != null ? filmData["Opis"].ToString() : String.Empty;
                    film.DugiOpis = filmData["DugiOpis"] != null ? filmData["DugiOpis"].ToString() : String.Empty;
                    film.Reziser = filmData["Reziser"] != null ? filmData["Reziser"].ToString() : String.Empty;
                    film.Slika = filmData["Slika"] != null ? filmData["Slika"].ToString() : String.Empty;
                    film.Zanr = filmData["Zanr"] != null ? filmData["Zanr"].ToString() : String.Empty;

                    List<Glumac> glumci = new List<Glumac>();
                    var glumaciData = session.Execute($"select * from \"Glumci\" where \"FilmID\" = '{film.ID}'");

                    foreach (var glumacData in glumaciData)
                    {
                        Glumac glumac = new Glumac();
                        glumac.Id = glumacData["FilmID"] != null ? glumacData["FilmID"].ToString() : String.Empty;
                        glumac.Ime = glumacData["Ime"] != null ? glumacData["Ime"].ToString() : String.Empty;
                        glumac.Uloga = glumacData["Uloga"] != null ? glumacData["Uloga"].ToString() : String.Empty;
                        glumac.TipUloge = glumacData["TipUloge"] != null ? glumacData["TipUloge"].ToString() : String.Empty;

                        glumci.Add( glumac );
                    }

                    film.Glumci = glumci;
                    filmovi.Add( film );
                }

                return filmovi;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public int MovieCount()
        {
            try { 
                Cassandra.ISession session = SessionManager.GetSession();
                int count = 0;

                if (session == null)
                    return 0;

                var filmsData = session.Execute("select count(*) from \"Filmovi\"");
                foreach (var f in filmsData)
                    count = f["count"] != null ? Int32.Parse(f["count"].ToString()) : 0;

                return count;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        public DBResponse InsertMovie(Film film)
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

                var insertFilmPs = session.Prepare(
                    "INSERT INTO \"Filmovi\" " +
                    "(\"ID\", \"DugiOpis\", \"Naziv\", \"Opis\", \"Reziser\", \"Slika\", \"Zanr\") " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?) IF NOT EXISTS;"
                );

                var filmResult = session.Execute(
                    insertFilmPs.Bind(
                        film.ID,
                        film.DugiOpis,
                        film.Naziv,
                        film.Opis,
                        film.Reziser,
                        film.Slika,
                        film.Zanr
                    )
                );

                if (!filmResult.First().GetValue<bool>("[applied]"))
                    return new DBResponse
                    {
                        Success = false,
                        Message = "Film sa datim id-jem vec postoji"
                    };

                var insertGlumacPs = session.Prepare(
                    "INSERT INTO \"Glumci\" " +
                    "(\"FilmID\", \"Ime\", \"TipUloge\", \"Uloga\") " +
                    "VALUES (?, ?, ?, ?) IF NOT EXISTS;"
                );

                foreach (var glumac in film.Glumci)
                {
                    if (glumac == null) continue;

                    session.Execute(
                        insertGlumacPs.Bind(
                            film.ID,
                            Tools.TransliterateToAscii(glumac.Ime),
                            Tools.TransliterateToAscii(glumac.TipUloge),
                            Tools.TransliterateToAscii(glumac.Uloga)
                        )
                    );
                }

                return new DBResponse
                {
                    Success = true,
                    Message = "Uspesno postavljeno"
                };
            }
            catch(Exception ex )
            {
                return new DBResponse
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        public Film FindMovie(string id)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();

                if (session == null)
                    return new Film();

                var resultSet = session.Execute($"select * from \"Filmovi\" where \"ID\" = '{id}';");

                var row = resultSet.FirstOrDefault();

                var stari = new Film
                {
                    ID = row.GetValue<string>("ID").ToString(),
                    DugiOpis = row.GetValue<string>("DugiOpis"),
                    Naziv = row.GetValue<string>("Naziv"),
                    Opis = row.GetValue<string>("Opis"),
                    Reziser = row.GetValue<string>("Reziser"),
                    Slika = row.GetValue<string>("Slika"),
                    Zanr = row.GetValue<string>("Zanr")
                };

                List<Glumac> glumci = new List<Glumac>();
                var glumaciData = session.Execute($"select * from \"Glumci\" where \"FilmID\" = '{id}'");

                foreach (var glumacData in glumaciData)
                {
                    Glumac glumac = new Glumac();
                    glumac.Id = glumacData["FilmID"] != null ? glumacData["FilmID"].ToString() : String.Empty;
                    glumac.Ime = glumacData["Ime"] != null ? glumacData["Ime"].ToString() : String.Empty;
                    glumac.Uloga = glumacData["Uloga"] != null ? glumacData["Uloga"].ToString() : String.Empty;
                    glumac.TipUloge = glumacData["TipUloge"] != null ? glumacData["TipUloge"].ToString() : String.Empty;

                    glumci.Add(glumac);
                }

                stari.Glumci = glumci;

                return stari;
            }
            catch (Exception ex)
            {
                return new Film();
            }
        }

        public bool UpdateMovie(Film film) {
            try
            {
                var session = SessionManager.GetSession();
                if (session == null)
                    return false;

                var updateFilmPs = session.Prepare(
                    "UPDATE \"Filmovi\" SET " +
                    "\"DugiOpis\" = ?, " +
                    "\"Naziv\" = ?, " +
                    "\"Opis\" = ?, " +
                    "\"Reziser\" = ?, " +
                    "\"Slika\" = ?, " +
                    "\"Zanr\" = ? " +
                    "WHERE \"ID\" = ? IF EXISTS;"
                );

                var updateResult = session.Execute(
                    updateFilmPs.Bind(
                        film.DugiOpis,
                        film.Naziv,
                        film.Opis,
                        film.Reziser,
                        film.Slika,
                        film.Zanr,
                        film.ID
                    )
                );

                if (!updateResult.First().GetValue<bool>("[applied]"))
                    return false;

                var deleteGlumciPs = session.Prepare(
                    "DELETE FROM \"Glumci\" WHERE \"FilmID\" = ?;"
                );

                session.Execute(deleteGlumciPs.Bind(film.ID));

                var insertGlumacPs = session.Prepare(
                    "INSERT INTO \"Glumci\" " +
                    "(\"FilmID\", \"Ime\", \"TipUloge\", \"Uloga\") " +
                    "VALUES (?, ?, ?, ?);"
                );

                foreach (var glumac in film.Glumci)
                {
                    if (glumac == null) continue;

                    session.Execute(
                        insertGlumacPs.Bind(
                            film.ID,
                            Tools.TransliterateToAscii(glumac.Ime),
                            Tools.TransliterateToAscii(glumac.TipUloge),
                            Tools.TransliterateToAscii(glumac.Uloga)
                        )
                    );
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
        public bool DeleteMovie(String filmid)
        {
            try
            {
                Cassandra.ISession session = SessionManager.GetSession();

                if (session == null)
                    return false;

                session.Execute($"DELETE FROM \"Filmovi\" WHERE \"ID\" = '{filmid}';");
                session.Execute($"DELETE FROM \"Glumci\" WHERE \"FilmID\" = '{filmid}';");

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}

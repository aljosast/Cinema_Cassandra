using Cinema.DBManager.Entities;
using System.Collections.Generic;
using System;
using System.Linq;

namespace Cinema.DBManager.Providers
{
    public class BioskopProvider
    {
        // 1. DOHVATANJE SVIH GRADOVA
        public List<string> GetAllCities()
        {
            var session = SessionManager.GetSession();
            if (session == null) return new List<string>();

            try 
            {
                // Uzimamo samo gradove (DISTINCT nije uvek podrzan na starijim verzijama, ali probajmo ovako)
                // Ako pukne na DISTINCT, vratićemo se na ručno filtriranje
                var rows = session.Execute("SELECT \"Grad\" FROM \"Bioskop\"");
                
                List<string> gradovi = new List<string>();
                foreach (var row in rows)
                {
                    if (!row.IsNull("Grad"))
                    {
                        string g = row.GetValue<string>("Grad");
                        if (!string.IsNullOrWhiteSpace(g) && !gradovi.Contains(g))
                        {
                            gradovi.Add(g);
                        }
                    }
                }
                return gradovi;
            }
            catch (Exception) { return new List<string>(); }
        }

        // 2. VRATI SVE BIOSKOPE
        public List<Bioskop> GetAllCinemas()
        {
            // Oprez: Ovo skenira celu bazu, ali za tvoj projekat je OK.
            return FetchCinemas("SELECT * FROM \"Bioskop\"");
        }

        // 3. VRATI BIOSKOPE PO GRADU
        public List<Bioskop> GetAllCinemas(string grad)
        {
            if (string.IsNullOrWhiteSpace(grad) || grad == "all") 
                return GetAllCinemas();

            // SJAJNA VEST: Pošto je "Grad" Partition Key, ovo je sada savršen upit!
            // Ne treba ALLOW FILTERING jer gađaš direktno particiju.
            string query = "SELECT * FROM \"Bioskop\" WHERE \"Grad\" = ?";
            
            return FetchCinemas(query, grad);
        }

        // --- HELPER ZA ČITANJE ---
        private List<Bioskop> FetchCinemas(string query, string param = null)
        {
            var session = SessionManager.GetSession();
            if (session == null) return new List<Bioskop>();

            try
            {
                Cassandra.RowSet rows;
                if (param != null)
                {
                    var statement = session.Prepare(query);
                    rows = session.Execute(statement.Bind(param));
                }
                else
                {
                    rows = session.Execute(query);
                }
                
                List<Bioskop> bioskopi = new List<Bioskop>();
                foreach (var row in rows)
                {
                    // Mapiranje 1 na 1 sa tvojom tabelom
                    bioskopi.Add(new Bioskop
                    {
                        ID = row.GetValue<string>("ID"),
                        Naziv = !row.IsNull("Naziv") ? row.GetValue<string>("Naziv") : "Bez naziva",
                        Grad = !row.IsNull("Grad") ? row.GetValue<string>("Grad") : "Nepoznat",
                        Adresa = !row.IsNull("Adresa") ? row.GetValue<string>("Adresa") : "",
                        
                        // BITNO: Inicijalizujemo praznu listu projekcija.
                        // Projekcije se učitavaju NAKNADNO preko ProjekcijaProvider-a
                        // da ne bi pucala aplikacija (N+1 problem rešen).
                        Projekcije = new List<Projekcija>() 
                    });
                }
                return bioskopi;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("GREŠKA: " + ex.Message);
                return new List<Bioskop>();
            }
        }

        // 4. INSERT (DODAVANJE)
        public bool InsertCinema(Bioskop b)
        {
            try
            {
                var session = SessionManager.GetSession();
                
                // Tvoja tabela traži ID, Naziv, Grad, Adresa
                var st = session.Prepare("INSERT INTO \"Bioskop\" (\"ID\", \"Naziv\", \"Grad\", \"Adresa\") VALUES (?, ?, ?, ?)");
                session.Execute(st.Bind(b.ID, b.Naziv, b.Grad, b.Adresa));
                return true;
            }
            catch { return false; }
        }

        // 5. UPDATE (IZMENA)
        public bool UpdateCinema(Bioskop b)
        {
            try
            {
                var session = SessionManager.GetSession();
                
                // KOD TEBE JE PRIMARNI KLJUČ (Grad, ID).
                // To znači da MOŽEŠ da menjaš Naziv i Adresu, ali NE MOŽEŠ da menjaš Grad ili ID direktno update-om.
                // Ovaj upit je ispravan za tvoju šemu:
                var st = session.Prepare("UPDATE \"Bioskop\" SET \"Naziv\"=?, \"Adresa\"=? WHERE \"Grad\"=? AND \"ID\"=?");
                session.Execute(st.Bind(b.Naziv, b.Adresa, b.Grad, b.ID));
                return true;
            }
            catch { return false; }
        }

        // 6. DELETE (BRISANJE)
        public bool DeleteCinema(string grad, string id)
        {
            try
            {
                var session = SessionManager.GetSession();

                // 1. Obriši projekcije tog bioskopa
                // Pošto je u tabeli Projekcija PK ("BioskopID", "ID"), 
                // BioskopID je Partition Key, pa je ovo brzo i sigurno!
                try {
                    var delProj = session.Prepare("DELETE FROM \"Projekcija\" WHERE \"BioskopID\" = ?");
                    session.Execute(delProj.Bind(id));
                } catch { /* Ignorišemo grešku ako nema projekcija */ }

                // 2. Obriši bioskop
                // Moraš navesti OBA dela primarnog ključa: Grad i ID
                var st = session.Prepare("DELETE FROM \"Bioskop\" WHERE \"Grad\" = ? AND \"ID\" = ?");
                session.Execute(st.Bind(grad, id));
                
                return true;
            }
            catch (Exception ex) 
            { 
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return false; 
            }
        }
    }
}
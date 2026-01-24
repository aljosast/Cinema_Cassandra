namespace Cinema.DBManager.Entities
{
    public class Rezervacija
    {
        public string ID { get; set; }
        public string Username { get; set; }
        public string ProjekcijaID { get; set; }
        public DateTime VremeProjekcije { get; set; }
        public string NazivFilma { get; set; }
        public string NazivBioskopa { get; set; }
        public string AdresaBioskopa { get; set; }
        public int UkupnaCena { get; set; }
        public int BrojMesta { get; set; }
    }
}
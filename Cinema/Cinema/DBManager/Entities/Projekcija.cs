namespace Cinema.DBManager.Entities
{
    public class Projekcija
    {
        public string ID { get; set; }
        public string FilmID { get; set; }
        public string BioskopID { get; set; }
        public int BrojSale { get; set; }
        public int BrojMesta { get; set; }
        public int BrojRezervacija { get; set; }
        public DateTime Vreme { get; set; }
        public string NazivFilma { get; set; }
        public string Slika { get; set; }
    }
}
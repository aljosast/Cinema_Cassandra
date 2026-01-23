namespace Cinema.DBManager.Entities
{
    public class Bioskop
    {
        public string ID { get; set; }
        public string Naziv { get; set; }
        public string Grad { get; set; }
        public string Adresa { get; set; }
        public List<Projekcija>? Projekcije { get; set; }
    }
}
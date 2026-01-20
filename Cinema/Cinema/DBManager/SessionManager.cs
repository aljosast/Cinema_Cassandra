using Cassandra;

namespace Cinema.DBManager
{
    public static class SessionManager
    {
        public static Cassandra.ISession session;

        public static Cassandra.ISession GetSession()
        {
            if (session == null)
            {
                Cluster cluster = Cluster.Builder().AddContactPoint("127.0.0.1").Build();
                session = cluster.Connect("cinema");
            }

            return session;
        }
    }
}

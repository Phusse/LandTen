using Npgsql;
using System;

class Program
{
    static void Main()
    {
        string connString = "Host=localhost;Database=landlordtenant_db;Username=postgres;Password=postgres";
        using var conn = new NpgsqlConnection(connString);
        conn.Open();
        using var cmd = new NpgsqlCommand("SELECT email, role, created_at FROM \"Users\" ORDER BY created_at DESC LIMIT 5", conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            Console.WriteLine($"{reader.GetString(0)} | {reader.GetInt32(1)} | {reader.GetDateTime(2)}");
        }
    }
}

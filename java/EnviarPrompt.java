import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;



public class EnviarPrompt {

    public static void main(String[] args) {
        long startTime = System.currentTimeMillis(); // Início do cronômetro

        try {
            URL url = new URL("https://api.iahub.site/chat");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("POST"); 
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept-Encoding", "gzip, deflate");
            connection.setRequestProperty("x-api-key", "SUA_API_KEY"); // Substitua por sua chave real

            // Corpo JSON
            String jsonBody = "{"
                    + "\"model\": \"MODELO_DE_IA\","
                    + "\"messages\": ["
                    + "  {"
                    + "    \"role\": \"system\","
                    + "    \"content\": \"INSTRUÇÕES_DE_COMO_O_SISTEMA_DEVE_SE_COMPORTAR!\""
                    + "  },"
                    + "  {"
                    + "    \"role\": \"user\","
                    + "    \"content\": \"PROMPT\""
                    + "  }"
                    + "]"
                    + "}";

            // Envia o corpo JSON
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonBody.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            // Código de resposta
            int responseCode = connection.getResponseCode();
            System.out.println("Codigo de resposta HTTP: " + responseCode);

            // Escolhe a stream correta (input ou erro)
            InputStream inputStream = (responseCode >= 200 && responseCode < 300)
                    ? connection.getInputStream()
                    : connection.getErrorStream();

            // Lê a resposta
            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, "utf-8"))) {
                String line;
                while ((line = br.readLine()) != null) {
                    response.append(line.trim());
                }
            }

            long elapsedTime = System.currentTimeMillis() - startTime;
            System.out.println("Tempo de resposta: " + elapsedTime + " ms");
            System.out.println("Corpo da resposta: " + response.toString());


        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

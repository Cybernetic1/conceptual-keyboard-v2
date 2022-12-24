package conkey;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.Writer;
import java.nio.file.Files;
// import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import java.util.HashMap;
import java.util.Map;
// import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import spark.Request;
import spark.Response;
// import javax.servlet.http.HttpServletResponse;
// import spark.Route;
import static spark.Spark.*;
import org.apache.commons.io.IOUtils;
// import org.apache.log4j.BasicConfigurator;

// For simple socket server
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import java.net.ServerSocket;
import java.net.Socket;

public class Conkey {

	public static Map<String, Object> staticpages = new HashMap();

	public static String getLocalTextFile(File file) throws IOException {
		int len = 0;
		char[] cb = new char[4096];
		final StringBuffer buffer = new StringBuffer();
//		try (FileReader reader = new FileReader(file))
//			{
//			while ((len = reader.read(chr)) > 0)
//				{
//				buffer.append(chr, 0, len);
//				}
//			}
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(file), "UTF-8"))) // FileReader reader = new FileReader(file))
		{
			while ((len = reader.read(cb)) > 0) {
				buffer.append(cb, 0, len);
			}
		}

		return buffer.toString();
	}

	public static void getLocalBinaryFile(File file, OutputStream os) throws IOException {

		byte[] buf = new byte[1024];
		OutputStreamWriter out;
		try (FileInputStream in = new FileInputStream(file)) {
			out = new OutputStreamWriter(os);
			int count;
			while ((count = in.read(buf)) >= 0) {
				os.write(buf, 0, count);
			}
		}
		out.close();
	}

	public static String getStaticTextFile(String path) throws IOException {
		if (staticpages.containsKey(path)) {
			return (String) staticpages.get(path);
		}
		String content = getLocalTextFile(new File("./web/" + path));
		staticpages.put(path, content);
		return content;
	}

	public static void getStaticBinaryFile(String path, OutputStream os) throws IOException {
		getLocalBinaryFile(new File("./web/" + path), os);
	}

	public static FFWebSocket echo;

	// private static BufferedReader inSocket;
	// private static BufferedWriter outSocket;
	public static void main(String[] args)
		{
		StringBuffer typings = new StringBuffer("");

		System.out.println("Calling Genifer3...");
		genifer3.Genifer3.main(null);

		// BasicConfigurator.configure();	// configures log4j logger
		Integer portNumber = 9090;			// Spark will run on port 9090
		setPort(portNumber);
		System.out.println("YKY set port to: " + portNumber.toString() + "\n");

		// secure("web/keystore.jks", "l0wsecurity", null, null);
		/*** Traditional sockets don't work because a single instance cannot
		 *** listen to multiple ports.
		 try
			{
			// ServerSocket server_socket = new ServerSocket(9009);

			// Socket client_socket = server_socket.accept();

				// inSocket = new BufferedReader(new InputStreamReader(client_socket.getInputStream()));
			//outSocket = new BufferedWriter(new OutputStreamWriter(client_socket.getOutputStream()));

			// Receive:
			//int ifirst_char;
				//char first_char;

			//if ((ifirst_char = in.read()) == -1)
				//	{  // Client Closed
				//	System.out.println("Client was closed on the other side.");
				//	}

			//first_char = (char) ifirst_char;
				//String msg = msg = String.valueOf(first_char);

			//msg += in.readLine();
			//msg = "Server Received: " + msg;
			} catch (Exception e)
			{
			e.printStackTrace();
			}
		 ***/
		//	echo = new FFWebSocket();

		// Route saveDatabase;
		post("/saveDatabase/:fname", (Request request, Response response)
				-> {
			response.header("Content-type", "text/html; charset=utf-8");
			String fname = request.params(":fname");

			File dir = new File("./web/");
			File[] files = dir.listFiles(new FilenameFilter() {
				@Override
				public boolean accept(File dir, String name) {
					return name.startsWith(fname);
				}
			});

			if (files.length == 0) {
				System.out.println("Cannot find any DB files.\n");
				return null;
			}

			long max = files[0].lastModified();
			int max_index = 0;
			for (int i = 0; i < files.length; ++i) {
				if (max < files[i].lastModified()) {
					max = files[i].lastModified();
					max_index = i;
				}
			}
			int version_num = Integer.parseInt(files[max_index].getName().replace(
					fname + ".", "").replace(".txt", "")) + 1;
			String fname2 = fname + "." + Integer.toString(version_num) + ".txt";

			String data = request.queryParams("data");
			// System.out.println("data is: " + data.substring(0, 100));
			try {
				try ( // Save in web/ directory
						PrintWriter out = new PrintWriter("./web/" + fname2)) {
					out.print(data);
				}
			} catch (FileNotFoundException ex) {
				Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
			}

			System.out.println("Saved DB: " + fname2 + ".\n");
			return "DB saved";
		});

		// Route loadDatabase
		get("/loadDatabase/:fname", (Request request, Response response)
				-> {
			response.header("Content-type", "text/html; charset=utf-8");
			String fname = request.params(":fname");

			File dir = new File("./web/");
			File[] files = dir.listFiles(new FilenameFilter() {
				@Override
				public boolean accept(File dir, String name) {
					return name.startsWith(fname);
				}
			});

			if (files.length == 0) {
				System.out.println("Cannot find any DB files.\n");
				return null;
			}

			long max = files[0].lastModified();
			int max_index = 0;
			for (int i = 0; i < files.length; ++i) {
				if (max < files[i].lastModified()) {
					max = files[i].lastModified();
					max_index = i;
				}
			}
			String fname2 = files[max_index].getName();

			// char[] cb = new char[4096];
			String data = "";
			try {

				data = new String(Files.readAllBytes(Paths.get("./web/" + fname2)));
			} catch (IOException ex) {
				Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
			}

			StringWriter writer = new StringWriter();
			try (InputStream inputStream = new FileInputStream("./web/" + fname2)) {
				data = IOUtils.toString(inputStream, "UTF-8");
				// IOUtils.copy(inputStream, writer, "UTF-8");
				// String data = writer.toString();
			}

			System.out.println("Loaded latest DB: " + fname2 + ".\n");
			return data;
		});

		post("/speakMandarin/", (Request request, Response response)
				-> {
			response.header("Content-type", "text/html; charset=utf-8");
			String text = request.queryParams("text");
			System.out.println("speak: " + text);
			try {
				// Invoke Ekho
				Process p = Runtime.getRuntime().exec("ekho " + text);
			} catch (IOException ex) {
				Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
			}
			return "Mandarin spoken\n";
		});

		post("/sendPidginMessage/:name", (Request request, Response response)
				-> {
			// System.out.println("sending Pidgin Message....");
			response.header("Content-type", "text/html; charset=utf-8");
			// String list = rqst.queryParams().toString();
			String name = request.params(":name");
			System.out.println("param is: " + name);
			String data = request.queryParams("data");
			System.out.println("data is: " + data);
			try {
				// Send to Pidgin
				Process p = Runtime.getRuntime().exec("./pidgin-message.py " + name + " " + data);
			} catch (IOException ex) {
				Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
			}
			return "Pidgin message sent\n";
		});

		// Route saveChatLog;
		post("/saveChatLog/:name", (Request request, Response response)
				-> {
			// System.out.println("saving database....");
			response.header("Content-type", "text/html; charset=utf-8");
			// String list = rqst.queryParams().toString();
			String fname = request.params(":name");
			String fname2 = java.net.URLDecoder.decode(fname, "UTF-8");
			System.out.println("param is: " + fname2);
			String data = request.queryParams("data");
			// System.out.println("data is: " + data);
			System.out.println("data obtained.");

			// Save file to local directory
			File file = new File("./logs/" + fname2);
			try {
				try (Writer output = new BufferedWriter(new FileWriter(file))) {
					output.write(data);
				}
				System.out.println("Chat history written.\n");

			} catch (Exception e) {
				System.out.println("Cannot create file.\n");
			}
			return "Chat history saved";
		});

		// Route fireFox
		post("/fireFoxOut/", (Request request, Response response)
				-> {
			// System.out.println("Sending to Firefox....");
			response.header("Content-type", "text/event-stream; charset=utf-8");
			// response.header("Access-Control-Allow-Origin", "*");
			String data = request.queryParams("data");
			System.out.println("data: " + data + "\r\n");

			// write to socket...?
			FFWebSocket.ffSession.getBasicRemote().sendText(data);
			return "Firefox outed";
		});

		// Route logTyping;
		post("/logTyping/", (Request request, Response response)
				-> {
			// System.out.println("logging Conkey typing....");
			response.header("Content-type", "text/html; charset=utf-8");
			String data = request.queryParams("data");
			System.out.println("Typing data is: " + data);

			// Save data to string buffer first
			typings.append(data + "\n");
			return "Typing";
		});

		// Route flushTyping;
		post("/flushTyping/", (Request request, Response response)
				-> {
			// System.out.println("logging Conkey typing....");
			response.header("Content-type", "text/html; charset=utf-8");

			if (typings.length() == 0) {
				return "Typing Log saved (empty)";
			}

			String fname = request.queryParams("data");
			System.out.println("Typing filename is: " + fname);
			// System.out.println("flush dummy data obtained.");

			// Save file to local directory
			File file = new File("./typings/" + fname);
			try {
				try (Writer output = new BufferedWriter(new FileWriter(file))) {
					output.write(typings.toString());
				}
				System.out.println("Typing Log written.\n");

			} catch (Exception e) {
				System.out.println("Cannot create Typing Log.\n");
			}

			typings.setLength(0);       // Clear contents
			return "Typing Log saved";
		});

		post("/saveTrainingPair/", (Request request, Response response)
				-> {
			// System.out.println("saving Training Pair....");
			response.header("Content-type", "text/html; charset=utf-8");

			String inStr = request.queryParams("input") + "\n";
			String outStr = request.queryParams("output") + "\n";
			System.out.print("input is: " + inStr);
			System.out.print("output is: " + outStr);

			// Append
			try {
				Files.write(Paths.get("./training-set.txt"), (inStr + outStr).getBytes(),
						StandardOpenOption.APPEND);
			} catch (IOException e) {
				System.out.println("Cannot append to ./training-set.txt.\n");
			}

			return "Training pair saved";
		});

		get("/askGenifer/cantonize/*", (Request request, Response response)
				-> {
			// System.out.println("asking Genifer....");
			response.header("Content-type", "text/html; charset=utf-8");
			// String list = rqst.queryParams().toString();
			// String action = request.params(":action");
			// System.out.println("param is: " + action);
			String data = request.queryParams("data");
			System.out.println("data is: " + data);
			// Ask Genifer
			// String result = genifer3.Genifer3.cantonize("什么");
			String result = "testing";
			// action + data;
			return "Canto:" + result;
		});

		get("/fireFoxIn/*", (Request request, Response response)
				->
					{
					// System.out.println("asking Genifer....");
					response.header("Content-type", "text/event-stream; charset=utf-8");
			// String list = rqst.queryParams().toString();
					// String action = request.params(":action");
					// System.out.println("param is: " + action);
					String data = request.queryParams("data");
					System.out.println("data is: " + data);
			// Ask Genifer
					// String result = genifer3.Genifer3.cantonize("什么");
					String result = "testing";
					// action + data;
					return "data: " + result + "\r\n";
					});

		get("/getPidginNames/*", (Request request, Response response)
				-> {
			response.header("Content-type", "text/html; charset=utf-8");
			// System.out.println("Working dir = " + System.getProperty("user.dir"));

			try {
				Process p = Runtime.getRuntime().exec("./pidgin-names.py");
			} catch (IOException ex) {
				Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
			}
			System.out.println("Executed shell script pidgin-names.py.\n");

			// at this point we need to wait about 1 second...
			try {
				Thread.sleep(1000);                 //1000 milliseconds is one second.
			} catch (InterruptedException ex) {
				Thread.currentThread().interrupt();
			}

			String pidginNames = "";
			try {
				pidginNames = new String(Files.readAllBytes(Paths.get("./pidgin-names.txt")));
			} catch (IOException ex) {
				Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
			}
			System.out.println("Read file pidgin-names.txt.\n");
			return pidginNames;
		});

		/*
		 get("/*.ogg", (request, response) -> {
		 String page = "index.html";
		 System.out.println("Sending OGG file");
		 response.header("Content-type", "audio/ogg");
		 getStaticBinaryFile(page, response.raw().getOutputStream());
		 return null;
		 });
		 */
		get("/*", (request, response)
				-> {
			String url = request.pathInfo();
			String page = "index.html";
			if (!url.equals("/")) {
				String xpage = url.substring(url.indexOf("/") + 1);
				if (page.length() > 0) {
					page = xpage;
				}
			}

			System.out.println("URL = " + url);
			System.out.println(request.url() + " -> " + page);

			try {
				if (page.endsWith(".jpg")) {
					response.header("Content-type", "image/jpg");
					response.header("Cache-Control", "no-cache");
					getStaticBinaryFile(page, response.raw().getOutputStream());
					return null;
				} else if (page.endsWith(".png")) {
					response.header("Content-type", "image/png");
					getStaticBinaryFile(page, response.raw().getOutputStream());
					return null;
				} else if (page.endsWith(".ogg")) {
					response.header("Content-type", "audio/ogg");
					getStaticBinaryFile(page, response.raw().getOutputStream());
					return null;
				} else if (page.endsWith(".gif")) {
					response.header("Content-type", "image/gif");
					getStaticBinaryFile(page, response.raw().getOutputStream());
					return null;
				} else if (page.endsWith(".ico")) {
					response.header("Content-type", "image/x-icon");
					getStaticBinaryFile(page, response.raw().getOutputStream());
					return null;
				} else if (page.endsWith(".html") || page.endsWith(".htm")) {
					response.header("Content-type", "text/html; charset=utf-8");
					return getStaticTextFile(page);
				} else if (page.endsWith(".js")) {
					// HttpServletResponse httpResponse = response.raw();
					// httpResponse.setCharacterEncoding("UTF-8");

					response.header("Content-type", "text/html; charset=utf-8");
					return getStaticTextFile(page);
				} else {
					return getStaticTextFile(page);
				}
			} catch (IOException ex) {
				try {
					halt(404, getStaticTextFile("404.html"));
				} catch (IOException ex1) {
					Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex1);
				}
			}
			return null;
		});

	}
}

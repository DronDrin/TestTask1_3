package ru.drondrin;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

import static java.lang.Float.parseFloat;
import static java.lang.Integer.parseInt;

public class ConfigReader {
    private final Properties properties;

    public ConfigReader(String pathToConfigFile) {
        properties = new Properties();
        try {
            properties.load(new FileInputStream(pathToConfigFile));
        } catch (IOException e) {
            System.err.println("Config file not found");
        }
    }

    public String stringProperty(String key) {
        return properties.getProperty(key);
    }

    public int intProperty(String key) {
        return parseInt(properties.getProperty(key));
    }

    public float floatProperty(String key) {
        return parseFloat(properties.getProperty(key));
    }
}

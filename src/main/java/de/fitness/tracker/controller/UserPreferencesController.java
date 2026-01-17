package de.fitness.tracker.controller;

import de.fitness.tracker.model.User;
import de.fitness.tracker.model.UserPreferences;
import de.fitness.tracker.repository.UserPreferencesRepository;
import de.fitness.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/preferences")
public class UserPreferencesController {

    @Autowired
    private UserPreferencesRepository preferencesRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPreferences(@PathVariable
    Long userId) {
        Optional<UserPreferences> prefs = preferencesRepository.findByUserId(userId);

        if (prefs.isEmpty()) {
            // Wenn keine Preferences existieren, Default-Werte erstellen
            Optional<User> user = userRepository.findById(userId);
            if (user.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            UserPreferences newPrefs = new UserPreferences();
            newPrefs.setUser(user.get());
            newPrefs.setDefaultRestTime(60);
            newPrefs.setWeightUnit("kg");

            UserPreferences saved = preferencesRepository.save(newPrefs);
            return ResponseEntity.ok(saved);
        }

        return ResponseEntity.ok(prefs.get());
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUserPreferences(@PathVariable
    Long userId, @RequestBody
    Map<String, Object> updates) {

        Optional<UserPreferences> prefsOpt = preferencesRepository.findByUserId(userId);
        UserPreferences prefs;

        if (prefsOpt.isEmpty()) {
            // Erstellen falls nicht vorhanden
            Optional<User> user = userRepository.findById(userId);
            if (user.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            prefs = new UserPreferences();
            prefs.setUser(user.get());
        } else {
            prefs = prefsOpt.get();
        }

        // Updates anwenden
        if (updates.containsKey("defaultRestTime")) {
            prefs.setDefaultRestTime((Integer) updates.get("defaultRestTime"));
        }
        if (updates.containsKey("weightUnit")) {
            prefs.setWeightUnit((String) updates.get("weightUnit"));
        }
        if (updates.containsKey("theme")) {
            prefs.setTheme((String) updates.get("theme"));
        }

        UserPreferences saved = preferencesRepository.save(prefs);
        return ResponseEntity.ok(saved);
    }
}